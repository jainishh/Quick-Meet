from fastapi import APIRouter, status, Cookie, Query
from typing import Optional
from src.Model.meeting_model import MeetingCreate
from src.controllers import meeting_controller

router = APIRouter()

@router.post("/schedule", status_code=status.HTTP_201_CREATED)
async def schedule_meeting(meeting_data: MeetingCreate, token: Optional[str] = Cookie(None, alias="token")):
    if not meeting_data.token:
        meeting_data.token = token
    return await meeting_controller.schedule_meeting(meeting_data)

@router.put("/{meeting_code}")
async def update_meeting(meeting_code: str, meeting_data: MeetingCreate, token: Optional[str] = Cookie(None, alias="token")):
    if not meeting_data.token:
        meeting_data.token = token
    return await meeting_controller.update_meeting(meeting_code, meeting_data)

@router.delete("/{meeting_code}")
async def delete_meeting(meeting_code: str, token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await meeting_controller.delete_meeting(meeting_code, effective_token)

@router.get("/")
async def get_user_meetings(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await meeting_controller.get_user_meetings(effective_token)

@router.post("/{meeting_code}/respond")
async def respond_to_meeting(meeting_code: str, action: str, token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await meeting_controller.respond_to_meeting(meeting_code, action, effective_token)
