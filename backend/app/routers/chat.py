from fastapi import APIRouter
from pydantic import BaseModel

from app.services.agent import agent


router=APIRouter()


class ChatRequest(BaseModel):
    message:str


@router.post("/chat")
def chat(request:ChatRequest):

    result=agent.process(
        request.message
    )

    return result
