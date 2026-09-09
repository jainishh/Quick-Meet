from pydantic import BaseModel
from beanie import Document
from datetime import datetime
from typing import Optional, Dict

class Notification(Document):
    recipient_username: str
    sender_username: str
    title: str
    body: str
    type: str  # e.g., 'meeting_invite', 'chat_message'
    timestamp: datetime = datetime.now()
    read: bool = False
    data: Optional[Dict[str, str]] = None

    class Settings:
        name = "notifications"

class UpdateFCMTokenRequest(BaseModel):
    token: str
    fcm_token: str
