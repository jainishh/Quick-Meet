from fastapi import APIRouter, Cookie, Query
from typing import Optional
from src.controllers import notification_controller

router = APIRouter()

@router.get("/")
async def get_notifications(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await notification_controller.get_notifications(effective_token)

@router.put("/read-all")
async def mark_all_read(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await notification_controller.mark_all_read(effective_token)

@router.put("/{notification_id}/read")
async def mark_read(notification_id: str, token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await notification_controller.mark_read(notification_id, effective_token)

@router.post("/{notification_id}/respond")
async def respond_to_invite(notification_id: str, action: str, token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await notification_controller.respond_to_invite(notification_id, action, effective_token)
