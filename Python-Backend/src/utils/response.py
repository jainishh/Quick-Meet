from fastapi import status
from fastapi.responses import JSONResponse

def success_response(message: str, data: dict = None, status_code: int = status.HTTP_200_OK):
    response = {"message": message}
    if data:
        response["data"] = data
    return JSONResponse(status_code=status_code, content=response)

def error_response(message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
    return JSONResponse(status_code=status_code, content={"message": message})
