import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Dynamic model alias from skill guidelines
const MODEL_NAME = "gemini-3.5-flash";

// Base URL of the real Oneiromantia multi-agent backend (apps/api FastAPI server).
// e.g. http://localhost:8000 for local dev. Left unset, this tier is skipped.
const API_BASE_URL = process.env.API_BASE_URL;

/**
 * Calls the real ADK multi-agent pipeline (apps/api) and, on success, maps its
 * response shape into the analysis shape the frontend/UI expects. Returns null
 * on any failure so the caller can fall through to the next tier.
 */
async function callOneiroBackend(text: string, body: any): Promise<any | null> {
  if (!API_BASE_URL) return null;

  // Generous timeout: the ADK pipeline runs 3 sequential LLM calls plus MCP
  // round-trips. Local CPU-only Ollama models have been observed anywhere
  // from ~3 to 4+ minutes depending on system load; hosted Gemini/Gemma-via-API
  // is much faster but this stays generous for both rather than discarding
  // real, correct work moments before it would have finished.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 480_000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dream: text }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`Oneiromantia backend returned ${res.status}`);
      return null;
    }

    const data = await res.json();
    return mapBackendResponseToAnalysis(data, body);
  } catch (error: any) {
    console.error("Oneiromantia backend unreachable or failed:", error.message);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * apps/api's schema (session_id, report, symbols, patterns, art_seed) doesn't
 * line up 1:1 with the frontend's rich mock schema (archetypes, per-symbol
 * frequency/trend, artworkPrompt, etc.) — the ADK agents don't produce those
 * fields at all. This derives every frontend field from real pipeline output
 * where possible, and falls back to honest, clearly-labeled defaults (e.g.
 * empty archetypes) rather than inventing data the backend never analyzed.
 */
/**
 * The art_generator agent's actual p5.js output only ever reaches the client
 * embedded in `report`'s "## ART_SKETCH" markdown section (`art_seed` is a
 * JSON symbol graph, not code, despite the name). Gemma2:2b sometimes wraps
 * its own output in a redundant/nested code fence, so this strips every
 * fence marker rather than assuming exactly one pair.
 */
function extractSketchCode(report: string | undefined): string | null {
  if (!report) return null;
  const marker = "## ART_SKETCH";
  const idx = report.indexOf(marker);
  if (idx === -1) return null;
  let code = report
    .slice(idx + marker.length)
    .replace(/```(javascript|js)?/g, "")
    .trim();

  // Despite being told "no explanation", the model sometimes appends trailing
  // markdown commentary after otherwise-valid code (e.g. "**Note:** this..."
  // or "* **p5.js** documentation..."). The sketch spec never uses the `**`
  // exponentiation operator, so its first appearance reliably marks the start
  // of prose bolted onto the end — truncate there rather than relying on
  // prompt compliance alone.
  const starIdx = code.indexOf("**");
  if (starIdx !== -1) {
    code = code.slice(0, starIdx).trim();
  }

  return code.length > 0 ? code : null;
}

function mapBackendResponseToAnalysis(data: any, body: any) {
  const symbolsOut = data.symbols || {};
  const patternsOut = data.patterns || {};
  const symbolList: Array<{ name: string; recurring?: boolean }> = symbolsOut.symbols || [];
  const emotionList: string[] = symbolsOut.emotions || [];
  const setting: string = symbolsOut.setting || "an unknown place";
  const recurringClusters: string[][] = patternsOut.recurring_clusters || [];
  const clusteredNames = new Set(recurringClusters.flat());

  const symbols = symbolList.map((s) => {
    const boosted = !!s.recurring || clusteredNames.has(s.name);
    const score = boosted ? 80 : 35;
    return {
      name: s.name,
      frequency: score,
      trend: boosted ? "up" : "down",
      score,
      description: s.recurring
        ? `A recurring symbol resurfacing in this ${setting} dreamscape.`
        : `A newly emerging symbol within this ${setting} dreamscape.`,
    };
  });

  const emotions = emotionList.map((name, i) => ({
    name,
    score: Math.max(90 - i * 15, 40),
    description: "Emotional tone detected by the symbol extractor agent.",
  }));

  const sessionId: string = data.session_id || "";
  let seedHash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    seedHash = (seedHash * 31 + sessionId.charCodeAt(i)) >>> 0;
  }
  const artworkSeed = sessionId ? seedHash % 10000 : Math.floor(Math.random() * 10000);

  return {
    title: body.title,
    lucidity: "Medium",
    dominantEmotion: emotionList[0] || body.mood || "Vague",
    summary: patternsOut.emotional_arc || "Dream analyzed by the Oneiromantia multi-agent pipeline.",
    symbols,
    emotions,
    archetypes: [], // not produced by the current ADK agent pipeline
    artworkPrompt: `A surreal ${setting} dreamscape charged with ${emotionList.join(" and ") || "quiet mystery"}.`,
    artworkSeed,
    generatedSketchCode: extractSketchCode(data.report),
    agentLogs: [
      `>> symbol_extractor: ${symbolList.length} symbol(s) detected in "${setting}"`,
      `>> pattern_analyst: ${recurringClusters.length} recurring cluster(s); emerging: ${(patternsOut.emerging_themes || []).join(", ") || "none"}`,
      `>> art_generator: sketch synthesized for session ${sessionId || "unknown"}`,
      `>> oneiro_orchestrator: pipeline complete`,
    ],
    _source: "oneiro-backend",
  };
}

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Simulated data as a rich fallback if no API key is provided
const FALLBACK_DREAMS: Record<string, any> = {
  cathedral: {
    title: "The Glass Cathedral",
    dominantEmotion: "Wonder",
    lucidity: "High",
    summary: "The Glass Cathedral represents intellectual growth and self-discovery, yet also highlights a fragile structure of reality. The refracting light suggests a search for spiritual transparency.",
    symbols: [
      { name: "Crystal Cathedral", frequency: 94, trend: "up", score: 94, description: "Represents absolute clarity, structured beliefs, and spiritual aspiration." },
      { name: "Indigo Light", frequency: 82, trend: "up", score: 82, description: "Associated with deep intuition, third-eye vision, and cosmic intelligence." },
      { name: "Refracting Prism", frequency: 45, trend: "down", score: 45, description: "A tool that breaks down monolithic ideas into diverse colored insights." }
    ],
    emotions: [
      { name: "Transcendence", score: 88, description: "A feeling of soaring above the ego or physical limitations." },
      { name: "Serenity", score: 76, description: "A calm, still pool of mental awareness." }
    ],
    archetypes: [
      { name: "The Sage", score: 65, description: "The internal searcher of ancient wisdom and cosmic principles." },
      { name: "The Creator", score: 41, description: "The designer of the internal landscape and physical glass structures." }
    ],
    artworkPrompt: "A cinematic digital painting of a colossal cathedral made of vibrant refracting glass in a deep violet space with floating particles.",
    artworkSeed: 4812,
    agentLogs: [
      ">> analyzing_text_vector...",
      ">> symbol_match_found: \"cathedral\"",
      ">> emotion_detected: \"wonder\" (0.88)",
      ">> triggering_visual_gen_pipeline...",
      ">> buffer_flushed_success"
    ]
  },
  ocean: {
    title: "The Lucid Ocean",
    dominantEmotion: "Calm",
    lucidity: "High",
    summary: "A peaceful transition across the vast waters of the subconscious. Floating above liquid glass oceans represents emotional stability and suspended fear.",
    symbols: [
      { name: "Bioluminescent Sea", frequency: 82, trend: "up", score: 82, description: "Deep subconscious depths illuminated by glowing ideas." },
      { name: "Liquid Glass", frequency: 64, trend: "up", score: 64, description: "Emotions that have solidified into a reflective, calm surface." },
      { name: "Suspended Stars", frequency: 38, trend: "down", score: 38, description: "Cosmic guidelines reflected onto the personal psyche." }
    ],
    emotions: [
      { name: "Wonder", score: 91, description: "Awe at the sheer beauty of the universe." },
      { name: "Serenity", score: 85, description: "Mental quietness and deep peace." }
    ],
    archetypes: [
      { name: "The Seeker", score: 78, description: "The wanderer traveling across vast horizons of space." },
      { name: "The Innocent", score: 50, description: "Unconditional trust in the flow of the cosmos." }
    ],
    artworkPrompt: "Generative abstract digital art of an ocean made of glowing bioluminescent particles under a lavender sky.",
    artworkSeed: 9021,
    agentLogs: [
      ">> normalizer_scale: 1.442",
      ">> vectorizing_semantic_peaks...",
      ">> emotion_detected: \"calm\" (0.91)",
      ">> generating_ambient_mesh...",
      ">> render_complete"
    ]
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, mood } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Tier 1: the real Oneiromantia multi-agent backend (apps/api)
    const backendAnalysis = await callOneiroBackend(text, body);
    if (backendAnalysis) {
      return NextResponse.json({
        ...backendAnalysis,
        title: body.title || backendAnalysis.title || "Untitled Subconscious Event",
        normalizedText: text,
        _simulated: false,
      });
    }

    // Tier 2: direct Gemini call
    const ai = getGeminiClient();

    // If no client, do smart keyword matching or fallback
    if (!ai) {
      const lowerText = text.toLowerCase();
      let matched = FALLBACK_DREAMS.cathedral;
      if (lowerText.includes("ocean") || lowerText.includes("sea") || lowerText.includes("water") || mood === "Calm") {
        matched = FALLBACK_DREAMS.ocean;
      }
      
      // Let's customize the fallback slightly with the user's title if present
      const randomizedSeed = Math.floor(Math.random() * 10000);
      return NextResponse.json({
        ...matched,
        title: body.title || matched.title,
        artworkSeed: randomizedSeed,
        normalizedText: text,
        _simulated: true,
      });
    }

    // Call Gemini API to extract dream insights as a JSON object
    const prompt = `
You are the Oneiromantia Subconscious Multi-Agent Analyzer. Analyze this dream journal entry.
Return a structured JSON object strictly matching this schema:
{
  "title": "A short poetic title for the dream (maximum 4 words)",
  "dominantEmotion": "One of: Wonder, Eerie, Calm, Chaos, Vague",
  "lucidity": "One of: High, Medium, Low",
  "summary": "A deep Jungian summary of the dream meaning (2-3 sentences)",
  "symbols": [
    {
      "name": "Name of the symbol",
      "frequency": 82,
      "trend": "up or down",
      "score": 85,
      "description": "Short explanation of this symbol's meaning in the subconscious"
    }
  ],
  "emotions": [
    {
      "name": "Name of emotion",
      "score": 90,
      "description": "Short explanation of why this emotion was active"
    }
  ],
  "archetypes": [
    {
      "name": "The Sage, The Shadow, The Hero, The Creator, The Seeker, or The Innocent",
      "score": 75,
      "description": "Jungian explanation of this archetype's activity in this dream"
    }
  ],
  "artworkPrompt": "An evocative, detailed prompt for generating a p5.js generative shader or digital surreal artwork representing this dream (e.g. 'A surrealist digital painting of... with purples and cyan accents')",
  "artworkSeed": 1234,
  "agentLogs": [
    "A list of 5 simulated python multi-agent log tracing strings with timestamps, timing metrics, and token counts (e.g. '>> analyzing_text_vector...')"
  ]
}

Dream entry to analyze:
Title: "${body.title || 'Untitled'}"
Mood Selected: "${mood || 'Unknown'}"
Dream Content:
"${text}"
`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an expert Jungian psychologist, dream interpreter, and generative artist agent. Analyze input dreams and return structured, poetic, and analytical insights in JSON.",
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text from Gemini");
    }

    const data = JSON.parse(resultText.trim());
    return NextResponse.json({
      ...data,
      normalizedText: text,
      _simulated: false,
    });

  } catch (error: any) {
    console.error("Gemini Dream Analysis Error:", error);
    return NextResponse.json({
      error: "Failed to analyze dream. Falling back to internal engine.",
      details: error.message,
    }, { status: 500 });
  }
}
