import os
import json
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


def ask_llm(prompt: str):

    response = client.chat.completions.create(

        model=MODEL,

        max_tokens=500,

        temperature=0.2,

        messages=[
            {
                "role": "system",
                "content": """
You are a coding agent.

You can create files.

Always respond ONLY in JSON format.

For normal answers:
{
 "type":"message",
 "content":"answer"
}

For creating a file:
{
 "type":"create_file",
 "path":"filename",
 "content":"file code"
}

For running a file:
{
 "type":"run",
 "path":"filename"
}
"""
            },
            {
                "role":"user",
                "content":prompt
            }
        ]
    )


    return response.choices[0].message.content
