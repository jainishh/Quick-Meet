import os
from datetime import datetime
from src.Model.meeting_model import Meeting, MeetingCreate
from src.Model.user_model import User
from fastapi import HTTPException, status
import uuid
from src.utils.notification_util import notify_meeting_invite


async def schedule_meeting(meeting_data: MeetingCreate):
    # Find user by token
    user = await User.find_one(User.token == meeting_data.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Normalize participants to list of dicts with status
    parts = meeting_data.participants
    if isinstance(parts, str):
        parts = [p.strip() for p in parts.split(',') if p.strip()]
    
    # Use a set to avoid duplicates and ensure host is not invited to their own meeting
    participant_set = set(parts)
    if user.username in participant_set:
        participant_set.remove(user.username)

    meeting_participants = [{"username": p, "status": "pending"} for p in participant_set]
    # Add host as confirmed
    meeting_participants.append({"username": user.username, "status": "confirmed"})

    meeting = Meeting(
        user_id=user.username,
        meetingCode=str(uuid.uuid4())[:8],
        title=meeting_data.title,
        description=meeting_data.description,
        startTime=meeting_data.startTime,
        endTime=meeting_data.endTime,
        participants=meeting_participants
    )
    await meeting.create()

    # Send notifications to participants
    if meeting_data.participants:
        # participants might be a comma-separated string or list, normalize to list
        import asyncio
        parts = meeting_data.participants
        if isinstance(parts, str):
            parts = [p.strip() for p in parts.split(',') if p.strip()]
            
        async def send_to_participant(p_username: str):
            # Do not send notification to the host
            if p_username == user.username:
                return

            try:
                p_user = await User.find_one(User.username == p_username)
                await notify_meeting_invite(
                    token=p_user.fcm_token if p_user else None,
                    inviter_name=user.name,
                    inviter_username=user.username,
                    recipient_username=p_username,
                    meeting_code=meeting.meetingCode,
                    meeting_link=f"{os.getenv('FRONTEND_URL')}/video-meet?roomID={meeting.meetingCode}"
                )
            except Exception as e:
                print(f"Failed to send schedule notification to {p_username}: {e}")

        # Fire off notifications concurrently
        await asyncio.gather(*(send_to_participant(p) for p in parts))

    return {"message": "Meeting scheduled successfully", "meeting_code": meeting.meetingCode}

async def update_meeting(meeting_code: str, meeting_data: MeetingCreate):
    user = await User.find_one(User.token == meeting_data.token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    meeting = await Meeting.find_one(Meeting.meetingCode == meeting_code)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    
    if meeting.user_id != user.username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this meeting")
    
    old_participants = meeting.participants
    
    # Normalize new participants
    new_parts = meeting_data.participants
    if isinstance(new_parts, str):
        new_parts = [p.strip() for p in new_parts.split(',') if p.strip()]
    
    new_participant_set = set(new_parts)
    if user.username in new_participant_set:
        new_participant_set.remove(user.username)

    # Get existing participant statuses to preserve them
    existing_participants = meeting.participants if isinstance(meeting.participants, list) else []
    status_map = {p["username"]: p["status"] for p in existing_participants if isinstance(p, dict)}
    
    updated_participants = []
    for p_username in new_participant_set:
        status = status_map.get(str(p_username), "pending")
        updated_participants.append({"username": p_username, "status": status})
    
    # Ensure host is included and confirmed
    updated_participants.append({"username": user.username, "status": "confirmed"})

    await meeting.update({"$set": {
        "title": meeting_data.title,
        "description": meeting_data.description,
        "startTime": meeting_data.startTime,
        "endTime": meeting_data.endTime,
        "participants": updated_participants
    }})
    
    # Send notifications to newly added participants
    if meeting_data.participants:
        import asyncio
        new_parts = meeting_data.participants
        old_parts_list = []
        
        if isinstance(old_participants, str):
            old_parts_list = [p.strip() for p in old_participants.split(',') if p.strip()]
        elif isinstance(old_participants, list):
            old_parts_list = old_participants
            
        if isinstance(new_parts, str):
            new_parts = [p.strip() for p in new_parts.split(',') if p.strip()]
            
        added_parts = [p for p in new_parts if p not in old_parts_list and p != user.username]
            
        if added_parts:
            async def send_to_participant(p_username: str):
                try:
                    p_user = await User.find_one(User.username == p_username)
                    await notify_meeting_invite(
                        token=p_user.fcm_token if p_user else None,
                        inviter_name=user.name,
                        inviter_username=user.username,
                        recipient_username=p_username,
                        meeting_code=meeting.meetingCode,
                        meeting_link=f"{os.getenv('FRONTEND_URL')}/video-meet?roomID={meeting.meetingCode}"
                    )
                except Exception as e:
                    print(f"Failed to send update notification to {p_username}: {e}")

            await asyncio.gather(*(send_to_participant(str(p)) for p in added_parts))
    
    return {"message": "Meeting updated successfully"}

async def delete_meeting(meeting_code: str, token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    meeting = await Meeting.find_one(Meeting.meetingCode == meeting_code)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    
    if meeting.user_id != user.username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this meeting")
    
    await meeting.delete()
    return {"message": "Meeting deleted successfully"}

async def get_user_meetings(token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    # Find meetings where the user is either the creator OR a participant (who hasn't rejected)
    meetings = await Meeting.find({
        "$or": [
            {"user_id": user.username},
            {
                "participants": {
                    "$elemMatch": {
                        "username": user.username,
                        "status": {"$ne": "rejected"}
                    }
                }
            },
            {"participants": user.username} # Fallback for old string format
        ]
    }).to_list()

    # Enrich participant data with names from DB
    enriched_meetings = []
    for m in meetings:
        meeting_obj: Meeting = m
        enriched_participants = []
        # participants is a list of usernames/emails or dicts
        for p_data in meeting_obj.participants:
            username = ""
            status_val = "pending"
            
            if isinstance(p_data, dict):
                username = p_data.get("username", "")
                status_val = p_data.get("status", "pending")
            else:
                # Handle old string format
                p_username = str(p_data)
                username = p_username
                if "(" in p_username and ")" in p_username:
                    username = p_username.split("(")[1].split(")")[0].strip()
            
            p_user = await User.find_one(User.username == username)
            if p_user:
                enriched_participants.append({
                    "name": p_user.name, 
                    "username": p_user.username, 
                    "status": status_val
                })
            else:
                # If user not found (e.g. invite by email only), use email as name
                name_part = username.split('@')[0] if '@' in username else username
                enriched_participants.append({
                    "name": name_part, 
                    "username": username, 
                    "status": status_val
                })
        
        m_dict = meeting_obj.dict() if hasattr(meeting_obj, "dict") else meeting_obj.model_dump()
        m_dict["participants"] = enriched_participants
        # Add a convenience field for the frontend to show total count
        m_dict["participantCount"] = len(enriched_participants)
        enriched_meetings.append(m_dict)
        
    return enriched_meetings

async def respond_to_meeting(meeting_code: str, action: str, token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    meeting = await Meeting.find_one(Meeting.meetingCode == meeting_code)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    
    updated = False
    new_participants = []
    for p in meeting.participants:
        if isinstance(p, dict) and p.get("username") == user.username:
            p["status"] = "confirmed" if action.lower() == "accept" else "rejected"
            updated = True
        new_participants.append(p)
    
    if updated:
        await meeting.update({"$set": {"participants": new_participants}})
        return {"status": "success", "message": f"Meeting {action}ed"}
    
    return {"status": "error", "message": "User not in participant list"}
