import firebase_admin
from firebase_admin import credentials, messaging
import os
import json
import base64
import re
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from src.Model.notification_model import Notification

def clean_private_key(pk: str) -> str:
    """Robustly cleans and formats a PEM private key."""
    if not pk:
        return ""
    
    # 1. Handle potential literal escapes and common mess-ups
    content = pk.replace("\\n", "\n").replace("\\r", "")
    
    # 2. Extract the base64 body by removing headers, footers, and ALL non-base64 chars
    markers = [
        "-----BEGIN PRIVATE KEY-----", 
        "-----END PRIVATE KEY-----",
        "-----BEGIN RSA PRIVATE KEY-----",
        "-----END RSA PRIVATE KEY-----",
        "-----BEGIN PRIVATE KEY-----",
        "-----END PRIVATE KEY-----"
    ]
    for marker in markers:
        content = content.replace(marker, "")
    
    # Filter for valid base64 characters only
    clean_body = "".join(re.findall(r"[A-Za-z0-9+/=]", content))
    
    # 3. Ensure length is multiple of 4 (padding)
    missing_padding = len(clean_body) % 4
    if missing_padding:
        clean_body += "=" * (4 - missing_padding)
    
    # 4. Reconstruct as standard PKCS#8 with 64-character folding
    header = "-----BEGIN PRIVATE KEY-----"
    footer = "-----END PRIVATE KEY-----"
    NL = "\n"
    
    folded_lines = [clean_body[i:i+64] for i in range(0, len(clean_body), 64)]
    return f"{header}{NL}{NL.join(folded_lines)}{NL}{footer}{NL}"

# Initialize Firebase Admin SDK
try:
    firebase_initialized = False
    firebase_creds_b64 = os.getenv("FIREBASE_CREDENTIALS_BASE64")
    
    if firebase_creds_b64:
        try:
            print("Attempting to initialize Firebase from FIREBASE_CREDENTIALS_BASE64...")
            decoded = base64.b64decode(firebase_creds_b64).decode('utf-8')
            cred_dict = json.loads(decoded)
            
            if "private_key" in cred_dict:
                cleaned_pk = clean_private_key(cred_dict["private_key"])
                cred_dict["private_key"] = cleaned_pk
            
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            firebase_initialized = True
            print("Firebase Admin initialized successfully from environment variable.")
        except Exception as inner_e:
            print(f"WARNING: Failed to initialize Firebase from environment variable: {inner_e}")
            # Diagnostic attempt is already done in logs usually
    
    if not firebase_initialized:
        # Fallback to local file
        cred_path = os.path.join(os.path.dirname(__file__), "..", "services", "firebase-service-account.json")
        if os.path.exists(cred_path):
            print(f"Attempting to initialize Firebase from {cred_path}...")
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            firebase_initialized = True
            print(f"Firebase Admin initialized successfully from {cred_path}")
        else:
            print(f"CRITICAL: Firebase service account file NOT found at {cred_path} and ENV var failed or missing.")
            
except Exception as e:
    print(f"CRITICAL Error during Firebase Admin setup: {e}")

async def send_push_notification(
    token: str, 
    title: str, 
    body: str, 
    data: Optional[Dict[str, str]] = None
) -> bool:
    """
    Sends a push notification to a specific device token.
    """
    if not firebase_admin._apps:
        print("Firebase Admin not initialized. Skipping notification.")
        return False

    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data=data or {},
            token=token,
        )
        response = messaging.send(message)
        print(f"Successfully sent notification: {response}")
        return True
    except Exception as e:
        print(f"Error sending push notification: {e}")
        return False

async def notify_meeting_invite(token: Optional[str], inviter_name: str, inviter_username: str, recipient_username: str, meeting_code: str, meeting_link: str = "", notif_type: str = "meeting_invite"):
    """
    Utility for meeting invitation notifications.
    """
    body = f"{inviter_name} is inviting you to a meeting."
    if meeting_link:
        body += f"\nRoom Link: {meeting_link}"
    
    success = False
    if token:
        success = await send_push_notification(
            token=token,
            title="New Meeting Invite",
            body=body,
            data={
                "type": notif_type,
                "meeting_code": meeting_code,
                "meeting_link": meeting_link,
                "click_action": "FLUTTER_NOTIFICATION_CLICK"
            }
        )
    
    # Always save to database
    try:
        notification_record = Notification(
            recipient_username=recipient_username,
            sender_username=inviter_username,
            title="New Meeting Invite",
            body=body,
            type=notif_type,
            data={
                "meeting_code": meeting_code, 
                "meeting_link": meeting_link,
                "inviter_username": inviter_username
            }
        )
        await notification_record.create()
    except Exception as e:
        print(f"Error saving notification to DB: {e}")
        
    return success

async def notify_new_message(token: str, sender_name: str, sender_username: str, recipient_username: str, message_preview: str):
    """
    Utility for new chat message notifications.
    """
    success = await send_push_notification(
        token=token,
        title=f"New Message from {sender_name}",
        body=message_preview[:100],
        data={"type": "chat_message"}
    )
    
    # Save to database
    try:
        notification_record = Notification(
            recipient_username=recipient_username,
            sender_username=sender_username,
            title=f"New Message from {sender_name}",
            body=message_preview[:100],
            type="chat_message"
        )
        await notification_record.create()
    except Exception as e:
        print(f"Error saving notification to DB: {e}")
        
    return success

async def notify_meeting_reminder(token: Optional[str], username: str, title: str, body: str, meeting_code: str):
    """
    Utility for meeting reminder notifications (24h or 30m before).
    """
    success = False
    if token:
        success = await send_push_notification(
            token=token,
            title="Meeting Reminder",
            body=body,
            data={
                "type": "meeting_reminder",
                "meeting_code": meeting_code,
                "click_action": "FLUTTER_NOTIFICATION_CLICK"
            }
        )
    
    # Save to database
    try:
        notification_record = Notification(
            recipient_username=username,
            sender_username="system",
            title="Meeting Reminder",
            body=body,
            type="meeting_reminder",
            data={
                "meeting_code": meeting_code
            }
        )
        await notification_record.create()
    except Exception as e:
        print(f"Error saving reminder to DB: {e}")
        
    return success

async def notify_friend_request(token: Optional[str], sender_name: str, sender_username: str, recipient_username: str):
    """
    Utility for friend request notifications.
    """
    title = "New Friend Request"
    body = f"{sender_name} (@{sender_username}) wants to be your friend."
    
    success = False
    if token:
        success = await send_push_notification(
            token=token,
            title=title,
            body=body,
            data={
                "type": "friend_request",
                "sender_username": sender_username,
                "click_action": "FLUTTER_NOTIFICATION_CLICK"
            }
        )
    
    # Save to database
    try:
        notification_record = Notification(
            recipient_username=recipient_username,
            sender_username=sender_username,
            title=title,
            body=body,
            type="friend_request",
            data={
                "sender_username": sender_username,
                "sender_name": sender_name
            }
        )
        await notification_record.create()
    except Exception as e:
        print(f"Error saving notification to DB: {e}")
        
    return success

async def notify_friend_accept(token: Optional[str], acceptor_name: str, acceptor_username: str, recipient_username: str):
    """
    Utility for friend request acceptance notifications.
    """
    title = "Friend Request Accepted"
    body = f"{acceptor_name} accepted your friend request!"
    
    success = False
    if token:
        success = await send_push_notification(
            token=token,
            title=title,
            body=body,
            data={
                "type": "friend_accepted",
                "acceptor_username": acceptor_username,
                "click_action": "FLUTTER_NOTIFICATION_CLICK"
            }
        )
    
    # Save to database
    try:
        notification_record = Notification(
            recipient_username=recipient_username,
            sender_username=acceptor_username,
            title=title,
            body=body,
            type="friend_accepted",
            data={
                "acceptor_username": acceptor_username,
                "acceptor_name": acceptor_name
            }
        )
        await notification_record.create()
    except Exception as e:
        print(f"Error saving notification to DB: {e}")
        
    return success
