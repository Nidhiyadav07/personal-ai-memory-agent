from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from app.database.mongodb import users_collection
from app.auth.security import (
    hash_password, verify_password, create_token, decode_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])
bearer = HTTPBearer(auto_error=False)

# One account per email
users_collection.create_index("email", unique=True)


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    email: str = Field(min_length=5, max_length=120)
    password: str = Field(min_length=8, max_length=72)



class LoginRequest(BaseModel):
    email: str
    password: str


def token_response(user: dict):
    return {
        "access_token": create_token(str(user["_id"])),
        "token_type": "bearer",
        "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
    }


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict:
    """Dependency: returns the logged-in user or raises 401."""
    user_id = decode_token(creds.credentials) if creds else None
    user = users_collection.find_one({"_id": ObjectId(user_id)}) if user_id else None
    if not user:
        raise HTTPException(status_code=401, detail="Please log in again.")
    return user


@router.post("/register")
def register(data: RegisterRequest):
    email = data.email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="This email is already registered.")

    user = {
        "name": data.name.strip(),
        "email": email,
        "password": hash_password(data.password),
    }
    user["_id"] = users_collection.insert_one(user).inserted_id
    return token_response(user)


@router.post("/login")
def login(data: LoginRequest):
    user = users_collection.find_one({"email": data.email.strip().lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return token_response(user)


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}
