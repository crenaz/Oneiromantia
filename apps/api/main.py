import uuid
import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from symbol_extractor import make_symbol_extractor
from pattern_analyst import make_pattern_analyst
from art_generator import make_art_generator
from orchestrator import make_orchestrator

def build_oneiro_app() -> Runner:
    """
    Wire everything together and return a Runner ready for use.
    """
    symbol_extractor = make_symbol_extractor()
    pattern_analyst  = make_pattern_analyst()
    art_generator    = make_art_generator()
    orchestrator     = make_orchestrator(symbol_extractor, pattern_analyst, art_generator)

    session_service = InMemorySessionService()

    runner = Runner(
        agent=orchestrator,
        app_name="oneiro",
        session_service=session_service,
    )

    return runner


async def run_demo():
    """
    Quick demo: submit one dream entry and print the orchestrator's response.
    """
    runner = build_oneiro_app()

    user_id    = "demo-user"
    session_id = str(uuid.uuid4())

    # Create a session first
    await runner.session_service.create_session(
        app_name="oneiro",
        user_id=user_id,
        session_id=session_id,
    )

    dream_input = (
        "I was standing at the edge of a vast black ocean. "
        "The water was completely still, like a mirror. "
        "Behind me was a glass tower that went up beyond the clouds. "
        "I felt a strange mixture of awe and dread — like I was being watched "
        "by something in the reflection."
    )

    print(f"Session: {session_id}")
    print(f"Dream  : {dream_input[:60]}...\n")
    print("=" * 60)

    # Stream the response turn by turn
    async for event in runner.run_async(
        user_id=user_id,
        session_id=session_id,
        new_message=genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=dream_input)],
        ),
    ):
        # Print agent activity as it streams
        if hasattr(event, "content") and event.content:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    print(part.text, end="", flush=True)

    print("\n" + "=" * 60)


if __name__ == "__main__":
    asyncio.run(run_demo())
