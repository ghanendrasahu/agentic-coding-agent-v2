import json
import re

from app.services.scanner import read_project_context
from app.services.llm import ask_llm
from app.services.file_manager import write_file
from app.services.executor import run_python


class CodingAgent:


    def extract_json(self, text):

        # remove markdown
        text = re.sub(
            r"```json|```",
            "",
            text,
            flags=re.IGNORECASE
        )

        # remove html tags like <p>
        text = re.sub(
            r"<[^>]*>",
            "",
            text
        )

        text = text.strip()


        # extract first JSON object
        match = re.search(
            r"\{.*\}",
            text,
            re.DOTALL
        )


        if match:
            return match.group(0)


        return text



    def process(self, message):

        context = read_project_context()


        response = ask_llm(
f"""
You are a coding agent.

Project files:
{context}

User request:
{message}

Return ONLY JSON.

Available actions:

CREATE FILE:
{{
"type":"create_file",
"path":"hello.py",
"content":"print('hello agent')"
}}

RUN FILE:
{{
"type":"run",
"path":"hello.py"
}}

CHAT:
{{
"type":"message",
"content":"answer"
}}
"""
        )


        print("AI RESPONSE:")
        print(response)


        clean = self.extract_json(response)


        print("CLEAN JSON:")
        print(clean)


        try:

            action = json.loads(clean)

        except Exception as e:

            print("JSON ERROR:", e)

            return {
                "response": response
            }



        print("ACTION:")
        print(action)



        if action.get("type") == "create_file":

            return {
                "response":
                write_file(
                    action["path"],
                    action["content"]
                )
            }



        if action.get("type") == "run":

            return {
                "response":
                run_python(
                    action["path"]
                )
            }



        if action.get("type") == "message":

            return {
                "response":
                action["content"]
            }



        return {
            "response":"Unknown action"
        }



agent = CodingAgent()
