import json
import re

from app.services.scanner import read_project_context
from app.services.llm import ask_llm
from app.services.file_manager import write_file



class CodingAgent:


    def process(self, message):

        context = read_project_context()


        response = ask_llm(
f"""
You are a coding agent.

Existing project:

{context}


User request:

{message}


Return JSON only.


For multiple files use:

{{
"type":"multi_create",
"files":[
{{
"path":"folder/file.py",
"content":"code"
}}
]
}}


For single file:

{{
"type":"create_file",
"path":"file.py",
"content":"code"
}}


For explanation:

{{
"type":"message",
"content":"answer"
}}
"""
        )


        clean = re.sub(
            r"```json|```",
            "",
            response
        ).strip()


        action=json.loads(clean)



        if action["type"]=="multi_create":

            results=[]

            for file in action["files"]:

                results.append(
                    write_file(
                        file["path"],
                        file["content"]
                    )
                )


            return {
                "response":
                "\n".join(results)
            }



        if action["type"]=="create_file":

            return {
                "response":
                write_file(
                    action["path"],
                    action["content"]
                )
            }



        if action["type"]=="message":

            return {
                "response":
                action["content"]
            }


        return {
            "response":"Unknown action"
        }



agent=CodingAgent()
