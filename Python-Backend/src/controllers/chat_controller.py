from fastapi import HTTPException, status
from typing import List
from src.Model.user_model import User
from src.Model.chat_model import ChatMessage, SendMessageRequest
from src.core.socket_instance import sio

async def get_chat_history(friend_username: str, token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Find messages between the two users, excluding those deleted by the current user
    messages = await ChatMessage.find(
        {"$and": [
            {"$or": [
                {"sender_username": user.username, "receiver_username": friend_username},
                {"sender_username": friend_username, "receiver_username": user.username}
            ]},
            {"deleted_by": {"$ne": user.username}}
        ]}
    ).sort("+timestamp").to_list()
    
    return [msg.dict(exclude={"id"}) for msg in messages]  # exclude ObjectID if needed, but returning dict is fine

async def send_message(data: SendMessageRequest):
    user = await User.find_one(User.token == data.token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    friend = await User.find_one(User.username == data.receiver_username)
    if not friend:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Receiver not found")

    new_message = ChatMessage(
        sender_username=user.username,
        receiver_username=friend.username,
        content=data.content
    )
    await new_message.create()

    message_data = new_message.dict()
    # converting ObjectId and datetime for JSON serialization
    if 'id' in message_data and message_data['id'] is not None:
        message_data['id'] = str(message_data['id'])
    if '_id' in message_data and message_data['_id'] is not None:
        message_data['_id'] = str(message_data['_id'])
    message_data['timestamp'] = getattr(new_message, 'timestamp').isoformat()

    # Emitting to the personal room of the receiver and the sender
    await sio.emit('receive-chat-message', message_data, room=friend.username)
    # Also emit back to the sender so other active sessions of the sender get it
    await sio.emit('receive-chat-message', message_data, room=user.username)

    return message_data

async def get_unread_counts(token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Aggregate unread messages by sender_username where receiver is current user
    pipeline = [
        {"$match": {"receiver_username": user.username, "read": False}},
        {"$group": {"_id": "$sender_username", "count": {"$sum": 1}}}
    ]
    # Beanie aggregate wrapper is crashing due to Motor version incompatibility (AsyncIOMotorLatentCommandCursor).
    # We must use underlying motor collection.
    collection = ChatMessage.get_motor_collection() if hasattr(ChatMessage, 'get_motor_collection') else ChatMessage.get_pymongo_collection()
    cursor = collection.aggregate(pipeline)
    counts = await cursor.to_list(length=None)
    
    # Convert [{"_id": "friend1", "count": 2}] to {"friend1": 2}
    unread_dict = {item["_id"]: item["count"] for item in counts}
    return unread_dict

async def mark_as_read(friend_username: str, token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Update all messages where sender is friend and receiver is me to read=True
    await ChatMessage.find(
        {"sender_username": friend_username, "receiver_username": user.username, "read": False}
    ).update({"$set": {"read": True}})
    
    return {"message": "Messages marked as read"}

async def clear_chat(friend_username: str, token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Hide all messages exchanged between the two users for the current user
    await ChatMessage.find(
        {"$or": [
            {"sender_username": user.username, "receiver_username": friend_username},
            {"sender_username": friend_username, "receiver_username": user.username}
        ]}
    ).update({"$addToSet": {"deleted_by": user.username}})
    
    return {"message": "Chat history cleared successfully"}
