from src.Model.user_model import User, UserRegister, UserLogin, AddToActivityRequest
from src.Model.meeting_model import Meeting
from fastapi import HTTPException, status, Response
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def register(user_data: UserRegister):
    # Check if username already exists
    existing_user = await User.find_one(User.username == user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create new user
    new_user = User(
        name=user_data.name,
        username=user_data.username,
        password=hashed_password
    )
    
    await new_user.create()
    
    return {"message": "User registered successfully"}

async def login(user_data: UserLogin, response: Response):
    user = await User.find_one(User.username == user_data.username)
    if not user or not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token = str(uuid.uuid4())
    user.token = token
    await user.save()
    
    # Set the cookie
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        max_age=60 * 60 * 24 * 7, # 7 days
        samesite="none", # Required for cross-site (Vercel to Render)
        secure=True # Must be True for samesite="none"
    )
    
    return {"message": "Login successful", "token": token, "name": user.name, "username": user.username, "profile_picture": user.profile_picture}

async def update_fcm_token(token: str, fcm_token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user.fcm_token = fcm_token
    await user.save()
    return {"message": "FCM token updated successfully"}

async def add_to_activity(user_data: AddToActivityRequest):
    token = user_data.token
    meeting_code = user_data.meeting_code
    
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    return {"message": "Meeting added to activity"}

async def get_all_activity(token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    meetings = await Meeting.find(Meeting.user_id == user.username).to_list()
    return meetings

async def update_profile_picture(data):
    token = data.token
    profile_picture = data.profile_picture
    
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user.profile_picture = profile_picture
    await user.save()
    return {"message": "Profile picture updated successfully", "profile_picture": profile_picture}

async def remove_profile_picture(token: str):
    user = await User.find_one(User.token == token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user.profile_picture = None
    await user.save()
    return {"message": "Profile picture removed successfully"}

async def check_auth(token: str):
    print(f"[Auth] Checking token from cookie: {token}")
    if not token:
        print("[Auth] No token found in cookie")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    user = await User.find_one(User.token == token)
    if not user:
        print(f"[Auth] No user found for token: {token}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    
    print(f"[Auth] User authenticated: {user.username}")
    return {
        "authenticated": True, 
        "user": {
            "name": user.name, 
            "username": user.username,
            "profile_picture": user.profile_picture
        }
    }

async def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Logged out successfully"}
