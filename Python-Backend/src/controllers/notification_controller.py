from fastapi import HTTPException, status
from src.Model.notification_model import Notification
from src.Model.user_model import User
from bson import ObjectId
from src.core.socket_instance import sio

async def get_notifications(token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # Sort by timestamp descending
    notifications = await Notification.find(Notification.recipient_username == user.username).sort(-Notification.timestamp).to_list()
    return notifications

async def mark_read(notification_id: str, token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    try:
        obj_id = ObjectId(notification_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID")
        
    notification = await Notification.get(obj_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        
    if notification.recipient_username != user.username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    await notification.delete()
    return {"message": "Notification deleted"}

async def mark_all_read(token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    await Notification.find(
        Notification.recipient_username == user.username
    ).delete()
    
    return {"message": "All notifications deleted"}

async def respond_to_invite(notification_id: str, action: str, token: str):
    # Verify user
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    try:
        obj_id = ObjectId(notification_id)
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification ID")
    
    notification = await Notification.get(obj_id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    
    if notification.recipient_username != user.username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    # Get meeting code from notification data
    meeting_code = notification.data.get("meeting_code")
    if not meeting_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid notification data")
    
    # Update meeting participant status
    from src.Model.meeting_model import Meeting
    meeting = await Meeting.find_one(Meeting.meetingCode == meeting_code)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    
    # Update status for the current user
    updated = False
    new_participants = []
    for p in meeting.participants:
        if isinstance(p, dict) and p.get("username") == user.username:
            p["status"] = "confirmed" if action.lower() == "accept" else "rejected"
            updated = True
        new_participants.append(p)
    
    if updated:
        await meeting.update({"$set": {"participants": new_participants}})
        # Notify host via Socket.IO
        try:
            from src.core.socket_instance import sio
            await sio.emit('meeting-update', {
                "meetingCode": meeting_code,
                "participant": user.username,
                "action": action
            }, room=meeting.user_id)
            print(f"Emitted meeting-update to host: {meeting.user_id}")
        except Exception as e:
            print(f"Failed to emit meeting-update: {e}")
    
    # Delete or mark notification as read
    await notification.delete()
    
    return {"message": f"Invitation {action}ed successfully"}
