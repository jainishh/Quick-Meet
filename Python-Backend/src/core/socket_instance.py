import socketio
import os

sio = socketio.AsyncServer(cors_allowed_origins=[
    "http://localhost:3000", 
    "https://quick-meet-coral.vercel.app",
    os.getenv("FRONTEND_URL")
], async_mode='asgi')
