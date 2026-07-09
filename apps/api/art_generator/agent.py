import os
from google.adk.agents.llm_agent import Agent
from oneiromantia_art_spec import ART_GENERATOR_INSTRUCTION

# Dynamic model selection for local Ollama vs cloud Gemini
if os.environ.get("USE_OLLAMA") == "true":
    from google.adk.models.lite_llm import LiteLlm
    MODEL = LiteLlm(model="ollama_chat/llama3.2:3b")
else:
    MODEL = "gemini-2.0-flash"

def make_art_generator() -> Agent:
    """
    Sub-agent 3: Art Generator
    Input  : art seed JSON from MCP (symbol graph with weights + emotions)
    Output : p5.js sketch code as a string
    """
    return Agent(
        name="art_generator",
        model=MODEL,
        description="Translates a symbol graph into a procedural p5.js sketch.",
        instruction=ART_GENERATOR_INSTRUCTION,
    )


agent = make_art_generator()
