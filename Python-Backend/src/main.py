from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio # This import is still needed for socketio.ASGIApp
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from src.core.socket_instance import sio # Added this import

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "https://quick-meet-coral.vercel.app",
        os.getenv("FRONTEND_URL")
    ],
    allow_headers=["*"],
    allow_credentials=True,        
    allow_methods=["*"],
)

# SocketIO initialization moved to core/socket_instance.py
socketio_app = socketio.ASGIApp(sio ,app)

from src.controllers.Socket_Controller import register_socket_events
register_socket_events(sio)

from src.db.database import init_db
from src.services.reminder_service import start_reminder_service
@app.on_event("startup")
async def startup_event():
    await init_db()
    start_reminder_service()


from src.routers import auth_router, meeting_router, friend_router, notification_router, chat_router

app.include_router(auth_router.router, prefix="/api/v1/users")
app.include_router(friend_router.router, prefix="/api/v1/friends")
app.include_router(meeting_router.router, prefix="/api/v1/meetings")
app.include_router(notification_router.router, prefix="/api/v1/notifications")
app.include_router(chat_router.router, prefix="/api/v1/chat")


@app.get("/")
def read_root():
    return {"message": "CORS is con `figured!"}

