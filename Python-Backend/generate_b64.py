import base64
import os

def generate():
    path = os.path.join("src", "services", "firebase-service-account.json")
    if not os.path.exists(path):
        print(f"ERROR: File not found at {path}")
        return

    with open(path, "rb") as f:
        content = f.read()
        encoded = base64.b64encode(content).decode("utf-8")
        print("--- COPY THE STRING BELOW ---")
        print(encoded)
        print("--- END OF STRING ---")
        print("\nNow, Go to Render -> Your Web Service -> Settings -> Environment Variables")
        print("Update 'FIREBASE_CREDENTIALS_BASE64' with the string above.")

if __name__ == "__main__":
    generate()
