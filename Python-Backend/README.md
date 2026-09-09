# Python Backend Setup

## 1. Create Virtual Environment
It is highly recommended to use a virtual environment to manage dependencies.

```powershell
# In the Python-Backend directory
python -m venv venv

# Activate the environment
.\venv\Scripts\activate
```

## 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

## 3. Environment Variables
Create a `.env` file in `Python-Backend` with your MongoDB URL:
```
MONGO_URL=mongodb+srv://... (your mongo url)
```

## 4. Run the Server
```powershell
uvicorn src.main:socket_app --reload
```
