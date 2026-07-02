from google.adk.agents.llm_agent import Agent

def make_symbol_extractor() -> Agent:
    """
    Sub-agent 1: Symbol Extractor
    Input  : normalized dream text + user symbol history (from MCP context)
    Output : JSON with symbols, emotions, setting
    """
    return Agent(
        name="symbol_extractor",
        model='gemini-2.0-flash',
        description="Extracts archetypal symbols, emotional tone, and setting from a dream.",
        instruction="""
You are a Jungian symbol analyst. Given a dream narrative, extract:
1. symbols   — a list of archetypal objects, figures, or motifs (e.g. "water", "tower", "shadow")
2. emotions  — the dominant emotional tones felt in the dream (e.g. "dread", "wonder")
3. setting   — the primary environment (e.g. "forest", "city", "void")

You will also receive the user's historical symbol list from the MCP dream journal.
Flag any symbol that has appeared in previous dreams by setting "recurring": true.

Always respond with valid JSON only. No prose. Example:
{
  "symbols":  [{"name": "water", "recurring": true}, {"name": "mirror", "recurring": false}],
  "emotions": ["wonder", "unease"],
  "setting":  "coastal cliff"
}
        """,
        # tools=[] — this agent reasons only; no tool calls needed.
        # It receives MCP context via the orchestrator's context-loading step.
    )
