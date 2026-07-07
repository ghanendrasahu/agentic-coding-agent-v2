import os
from dotenv import load_dotenv
from openai import OpenAI


load_dotenv()


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL"),
    default_headers={
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "Agentic Coding Agent"
    }
)


MODEL = os.getenv(
    "MODEL",
    "deepseek/deepseek-chat-v3-0324"
)


SYSTEM_PROMPT = """
You are an AI coding agent.

Always respond with ONLY valid JSON.

Available actions:

Create a file:

{
    "type":"create_file",
    "path":"main.py",
    "content":"print('hello')"
}

Edit an existing file:

{
    "type":"edit_file",
    "path":"main.py",
    "content":"new file content"
}

Delete a file:

{
    "type":"delete_file",
    "path":"main.py"
}

Run a Python file:

{
    "type":"run",
    "path":"main.py"
}

Normal conversation:

{
    "type":"message",
    "content":"your answer"
}

Rules:

- Never use markdown.
- Never wrap JSON inside ``` blocks.
- Return exactly one JSON object.
- When the user asks to modify a file, use "edit_file".
- When the user asks to remove a file, use "delete_file".
- When the user asks to create a file, use "create_file".
- When the user asks to execute a Python file, use "run".
"""


def ask_llm(prompt: str):

    response = client.chat.completions.create(

        model=MODEL,

        temperature=0.2,

        max_tokens=500,

        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response.choices[0].message.content
