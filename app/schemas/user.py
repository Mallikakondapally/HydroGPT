from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str
    weight_kg: float

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    weight_kg: Optional[float] = None
    custom_daily_goal_ml: Optional[int] = None
    reminder_enabled: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    weight_kg: float
    daily_goal_ml: int
    reminder_enabled: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
