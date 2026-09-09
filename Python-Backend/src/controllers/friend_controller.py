import os
from src.utils.notification_util import notify_meeting_invite, notify_friend_request, notify_friend_accept
from pydantic import BaseModel
from typing import List, Optional
from fastapi import HTTPException, status
from src.Model.user_model import User
from src.Model.friend_model import Friend

class InviteRequest(BaseModel):
    token: Optional[str] = None
    friend_username: str
    meeting_code: str

class AddFriendRequest(BaseModel):
    token: Optional[str] = None
    friend_username: str

async def search_users(query: str):
    # Search for users by name or username, limiting results
    users = await User.find({"$or": [
        {"username": {"$regex": query, "$options": "i"}},
        {"name": {"$regex": query, "$options": "i"}}
    ]}).limit(10).to_list()
    
    return [{"name": u.name, "username": u.username} for u in users]

async def add_friend(data: AddFriendRequest):
    # Verify user by token
    user = await User.find_one(User.token == data.token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # Check if friend exists
    friend_user = await User.find_one(User.username == data.friend_username)
    if not friend_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if friend_user.username == user.username:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot add yourself as a friend")

    # Get records for both
    my_record = await Friend.find_one(Friend.user_id == user.username)
    if not my_record:
        my_record = Friend(user_id=user.username)
        await my_record.create()

    their_record = await Friend.find_one(Friend.user_id == friend_user.username)
    if not their_record:
        their_record = Friend(user_id=friend_user.username)
        await their_record.create()
    
    if data.friend_username in my_record.friends:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already in your friend list")
    
    if data.friend_username in my_record.sent_requests:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Friend request already sent")

    # Add to my sent and their pending
    my_record.sent_requests.append(data.friend_username)
    their_record.pending_requests.append(user.username)
    
    await my_record.save()
    await their_record.save()
    
    # Notify
    await notify_friend_request(
        token=friend_user.fcm_token,
        sender_name=user.name,
        sender_username=user.username,
        recipient_username=friend_user.username
    )
    
    return {"message": "Friend request sent successfully"}

async def accept_friend_request(data: AddFriendRequest):
    user = await User.find_one(User.token == data.token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # 'friend_username' in data is the person who SENT the request
    requester = await User.find_one(User.username == data.friend_username)
    if not requester:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Requester not found")

    my_record = await Friend.find_one(Friend.user_id == user.username)
    their_record = await Friend.find_one(Friend.user_id == requester.username)

    if not my_record or data.friend_username not in my_record.pending_requests:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No pending request from this user")

    # Add to friends list
    if data.friend_username not in my_record.friends:
        my_record.friends.append(data.friend_username)
    if user.username not in their_record.friends:
        their_record.friends.append(user.username)

    # Remove from requests
    if data.friend_username in my_record.pending_requests:
        my_record.pending_requests.remove(data.friend_username)
    if user.username in their_record.sent_requests:
        their_record.sent_requests.remove(user.username)

    await my_record.save()
    await their_record.save()

    # Notify requester
    await notify_friend_accept(
        token=requester.fcm_token,
        acceptor_name=user.name,
        acceptor_username=user.username,
        recipient_username=requester.username
    )

    return {"message": "Friend request accepted"}

async def reject_friend_request(data: AddFriendRequest):
    user = await User.find_one(User.token == data.token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    my_record = await Friend.find_one(Friend.user_id == user.username)
    their_record = await Friend.find_one(Friend.user_id == data.friend_username)

    if my_record and data.friend_username in my_record.pending_requests:
        my_record.pending_requests.remove(data.friend_username)
        await my_record.save()
    
    if their_record and user.username in their_record.sent_requests:
        their_record.sent_requests.remove(user.username)
        await their_record.save()

    return {"message": "Friend request rejected"}

async def get_friends_list(token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    friend_record = await Friend.find_one(Friend.user_id == user.username)
    if not friend_record:
        return {"friends": [], "pending": [], "sent": []}
    
    async def get_details(usernames):
        details = []
        for uname in usernames:
            u = await User.find_one(User.username == uname)
            if u:
                details.append({"name": u.name, "username": u.username})
        return details

    friends = await get_details(friend_record.friends)
    pending = await get_details(friend_record.pending_requests)
    sent = await get_details(friend_record.sent_requests)
            
    return {"friends": friends, "pending": pending, "sent": sent}

async def invite_to_meeting(data: InviteRequest):
    # Verify sender
    sender = await User.find_one(User.token == data.token)
    if not sender:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # Get friend details (specifically their fcm_token)
    friend = await User.find_one(User.username == data.friend_username)
    if not friend:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Friend not found")
    
    # Send notification (this will save to DB even if token is missing)
    try:
        success = await notify_meeting_invite(
            token=friend.fcm_token,
            inviter_name=sender.name,
            inviter_username=sender.username,
            recipient_username=friend.username,
            meeting_code=data.meeting_code,
            meeting_link=f"{os.getenv('FRONTEND_URL')}/video-meet?roomID={data.meeting_code}",
            notif_type="direct_meet"
        )
        
        if success:
            return {"message": "Invite sent and push notification delivered", "sent": True}
        else:
            return {"message": "Invite saved to notifications (push failed or not enabled)", "sent": True}
    except Exception as e:
        print(f"Error in invite_to_meeting: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Notification error: {str(e)}"
        )
