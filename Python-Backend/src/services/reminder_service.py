import asyncio
from datetime import datetime, timedelta
from src.Model.meeting_model import Meeting
from src.Model.user_model import User
from src.utils.notification_util import notify_meeting_reminder
from src.core.socket_instance import sio

async def check_meeting_reminders():
    """
    Background loop that checks for upcoming meetings and sends reminders.
    Runs every 60 seconds.
    """
    print("Starting Meeting Reminder Service...")
    while True:
        try:
            now = datetime.now()
            
            # 1. Check for 24h reminders
            # Window: between 24h and 23h55m from now
            target_24h = now + timedelta(hours=24)
            meetings_24h = await Meeting.find(
                Meeting.startTime <= target_24h,
                Meeting.startTime > now + timedelta(hours=23, minutes=55),
                Meeting.reminded_24h == False
            ).to_list()

            for meeting in meetings_24h:
                await send_reminders(meeting, "24 hours", "reminded_24h")

            # 2. Check for 30m reminders
            # Window: between 30m and 25m from now
            target_30m = now + timedelta(minutes=30)
            meetings_30m = await Meeting.find(
                Meeting.startTime <= target_30m,
                Meeting.startTime > now + timedelta(minutes=25),
                Meeting.reminded_30m == False
            ).to_list()

            for meeting in meetings_30m:
                await send_reminders(meeting, "30 minutes", "reminded_30m")

        except Exception as e:
            print(f"Error in meeting reminder service: {e}")
        
        await asyncio.sleep(60)

async def send_reminders(meeting, time_label, field_name):
    """
    Sends reminders to the host and all confirmed participants.
    """
    print(f"Sending {time_label} reminders for meeting: {meeting.title}")
    
    # 1. Notify Host
    host = await User.find_one(User.username == meeting.user_id)
    if host:
        await notify_meeting_reminder(
            token=host.fcm_token,
            username=host.username,
            title=f"Reminder: {meeting.title}",
            body=f"Your meeting '{meeting.title}' is starting in {time_label}.",
            meeting_code=meeting.meetingCode
        )
        # Emit Socket event
        await sio.emit('meeting-update', {'type': 'reminder', 'meetingCode': meeting.meetingCode}, room=host.username)

    # 2. Notify Confirmed Participants
    for participant in meeting.participants:
        if participant.get('status') == 'confirmed':
            p_user = await User.find_one(User.username == participant.get('username'))
            if p_user:
                await notify_meeting_reminder(
                    token=p_user.fcm_token,
                    username=p_user.username,
                    title=f"Meeting Reminder",
                    body=f"Meeting '{meeting.title}' is starting in {time_label}.",
                    meeting_code=meeting.meetingCode
                )
                # Emit Socket event
                await sio.emit('meeting-update', {'type': 'reminder', 'meetingCode': meeting.meetingCode}, room=p_user.username)

    # Mark as reminded
    setattr(meeting, field_name, True)
    await meeting.save()

def start_reminder_service():
    """
    Initializes the background task.
    """
    asyncio.create_task(check_meeting_reminders())
