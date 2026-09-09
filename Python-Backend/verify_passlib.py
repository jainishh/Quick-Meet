from passlib.context import CryptContext
try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hash = pwd_context.hash("testpassword")
    print("SUCCESS: " + hash)
except Exception as e:
    print("FAILURE: " + str(e))
