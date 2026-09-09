import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

async def test_conn():
    load_dotenv()
    uri = os.getenv("MONGO_URL")
    print(f"Testing connection to: {uri[:40]}...")
    try:
        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
        await client.admin.command('ping')
        print("SUCCESS: Connected to MongoDB!")
    except Exception as e:
        print(f"FAILED: Could not connect to MongoDB: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
