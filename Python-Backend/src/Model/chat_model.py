from pydantic import BaseModel, Field
from beanie import Document
from datetime import datetime, timezone
from typing import Optional

class ChatMessage(Document):
    sender_username: str
    receiver_username: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False
    deleted_by: list[str] = Field(default_factory=list)

    class Settings:
        name = "chat_messages"

class SendMessageRequest(BaseModel):
    token: Optional[str] = None
    receiver_username: str
    content: str
