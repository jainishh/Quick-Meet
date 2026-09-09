from beanie import Document
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(Document):
    name: str 
    username: str
    password: str
    token: Optional[str] = None
    fcm_token: Optional[str] = None
    profile_picture: Optional[str] = None

    class Settings:
        name = "users"

class UserRegister(BaseModel):
    name: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class AddToActivityRequest(BaseModel):
    token: Optional[str] = None
    meeting_code: str

class GoogleLoginRequest(BaseModel):
    access_token: str

class UpdateProfilePictureRequest(BaseModel):
    token: Optional[str] = None
    profile_picture: str # Base64 string
