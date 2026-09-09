from beanie import Document
from pydantic import Field
from typing import List

class Friend(Document):
    user_id: str
    friends: List[str] = Field(default_factory=list)
    pending_requests: List[str] = Field(default_factory=list) # Incoming
    sent_requests: List[str] = Field(default_factory=list)    # Outgoing

    class Settings:
        name = "friends"
