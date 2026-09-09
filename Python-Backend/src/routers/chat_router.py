from fastapi import APIRouter, status, Query, Cookie
from typing import Optional
from src.controllers import chat_controller
from src.Model.chat_model import SendMessageRequest

router = APIRouter()

@router.get("/list/{friend_username}")
async def get_chat_history(friend_username: str, token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await chat_controller.get_chat_history(friend_username, effective_token)

@router.post("/send", status_code=status.HTTP_200_OK)
async def send_message(data: SendMessageRequest, token: Optional[str] = Cookie(None, alias="token")):
    if not data.token:
        data.token = token
    return await chat_controller.send_message(data)

@router.get("/unread")
async def get_unread_counts(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await chat_controller.get_unread_counts(effective_token)

@router.post("/read/{friend_username}")
async def mark_as_read(friend_username: str, token: Optional[str] = Cookie(None, alias="token")):
    return await chat_controller.mark_as_read(friend_username, token)

@router.delete("/clear/{friend_username}")
async def clear_chat(friend_username: str, token: Optional[str] = Cookie(None, alias="token")):
    return await chat_controller.clear_chat(friend_username, token)
