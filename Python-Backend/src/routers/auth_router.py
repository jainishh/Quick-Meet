from fastapi import APIRouter, status, Body, Response, Cookie, Query
from typing import Optional
from src.Model.user_model import UserRegister, UserLogin, AddToActivityRequest, GoogleLoginRequest, UpdateProfilePictureRequest
from src.Model.notification_model import UpdateFCMTokenRequest
from src.controllers import auth_controller

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserRegister):
    return await auth_controller.register(user_data)

@router.post("/login")
async def login_user(user_data: UserLogin, response: Response):
    return await auth_controller.login(user_data, response)

@router.post("/google-login")
async def google_login(user_data: GoogleLoginRequest):
    return await auth_controller.google_login(user_data)

@router.post("/update_fcm_token")
async def update_fcm_token(data: UpdateFCMTokenRequest, token: Optional[str] = Cookie(None, alias="token")):
    effective_token = data.token or token
    return await auth_controller.update_fcm_token(effective_token, data.fcm_token)

@router.post("/add_to_activity")
async def add_to_activity(user_data: AddToActivityRequest, token: Optional[str] = Cookie(None, alias="token")):
    if not user_data.token:
        user_data.token = token # Inject token from cookie if missing from body
    return await auth_controller.add_to_activity(user_data)

@router.get("/get_all_activity")
async def get_all_activity(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await auth_controller.get_all_activity(effective_token)

@router.put("/update_profile_picture")
async def update_profile_picture(data: UpdateProfilePictureRequest, token: Optional[str] = Cookie(None, alias="token")):
    if not data.token:
        data.token = token # Inject token from cookie if missing from body
    return await auth_controller.update_profile_picture(data)

@router.delete("/remove_profile_picture")
async def remove_profile_picture(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await auth_controller.remove_profile_picture(effective_token)

@router.get("/check_auth")
async def check_auth(token: Optional[str] = Query(None), cookie_token: Optional[str] = Cookie(None, alias="token")):
    effective_token = token or cookie_token
    return await auth_controller.check_auth(effective_token)

@router.post("/logout")
async def logout(response: Response):
    return await auth_controller.logout(response)
