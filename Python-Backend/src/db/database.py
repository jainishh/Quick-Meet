import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from src.Model.user_model import User
from src.Model.meeting_model import Meeting
from src.Model.friend_model import Friend
from src.Model.notification_model import Notification
from src.Model.chat_model import ChatMessage

async def init_db():
    client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
    await init_beanie(database=client[os.getenv("MONGO_DB_NAME", "QuickMeetCluster")], document_models=[User, Meeting, Friend, Notification, ChatMessage])
