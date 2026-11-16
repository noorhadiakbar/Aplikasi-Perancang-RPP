"""Auth request/response models (mirrored by TS interfaces in frontend/src/lib/types.ts)."""

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    school: str = Field(default="", max_length=160)
    nip: str = Field(default="", max_length=40)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    school: str
    nip: str
