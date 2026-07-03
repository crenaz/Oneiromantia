from google.adk.agents.llm_agent import Agent

def make_pattern_analyst() -> Agent:
    """
    Sub-agent 2: Pattern Analyst
    Input  : current dream symbols + full symbol history from MCP
    Output : cross-session pattern report in JSON
    """
    return Agent(
        name="pattern_analyst",
        model="gemini-2.0-flash",
        description="Identifies recurring themes and symbol clusters across dream sessions.",
        instruction="""
You are a dream pattern analyst. You will receive:
- The symbols extracted from today's dream
- A historical frequency table of all symbols the user has ever recorded

Your job is to identify:
1. recurring_clusters — groups of symbols that tend to co-occur
2. emotional_arc      — how the user's emotional tone has shifted over recent sessions
3. emerging_themes    — symbols appearing for the first time or increasing in frequency

Respond with valid JSON only. Example:
{
  "recurring_clusters": [["water", "mirror", "reflection"], ["tower", "falling"]],
  "emotional_arc": "Shift from dread-dominant toward wonder over last 14 days.",
  "emerging_themes": ["labyrinth"]
}
        """,
    )


agent = make_pattern_analyst()
