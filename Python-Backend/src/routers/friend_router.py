from fastapi import APIRouter, status, Query, Cookie
from typing import Optional
from src.controllers import friend_controller
from src.controllers.friend_controller import AddFriendRequest, InviteRequest

router = APIRouter()

@router.get("/search")
async def search_users(query: str = Query(...)):
    return await friend_controller.search_users(query)

@router.post("/add", status_code=status.HTTP_200_OK)
async def add_friend(data: AddFriendRequest, token: Optional[str] = Cookie(None, alias="token")):
    if not data.token:
        data.token = token
    return await friend_controller.add_friend(data)

@router.post("/accept")
async def accept_friend(data: AddFriendRequest, token: Optional[str] = Cookie(None, alias="token")):
    if not data.token:
        data.token = token
    return await friend_controller.accept_friend_request(data)

@router.post("/reject")
async def reject_friend(data: AddFriendRequest, token: Optional[str] = Cookie(None, alias="token")):
    if not data.token:
        data.token = token
    return await friend_controller.reject_friend_request(data)

@router.post("/invite")
async def invite_friend(data: InviteRequest, token: Optional[str] = Cookie(None, alias="token")):
    if not data.token:
        data.token = token
    return await friend_controller.invite_to_meeting(data)

@router.get("/list")
async def get_friends(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await friend_controller.get_friends_list(effective_token)
