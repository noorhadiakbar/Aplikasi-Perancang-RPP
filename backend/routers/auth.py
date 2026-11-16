"""Multi-guru auth: register / login / me / logout over httpOnly cookie sessions."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from lib.db import db
from lib.security import hash_password, new_session_token, session_expiry, verify_password
from models.auth import LoginIn, RegisterIn, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

SESSION_COOKIE = "session"
SESSION_MAX_AGE = 60 * 60 * 24 * 30  # 30 days


def _naive_to_utc(dt: datetime) -> datetime:
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_MAX_AGE,
        path="/",
    )


async def _start_session(response: Response, user_id: str) -> None:
    token = new_session_token()
    await db.sessions.insert_one(
        {"token": token, "user_id": user_id, "expires_at": session_expiry()}
    )
    _set_cookie(response, token)


async def get_current_user(request: Request) -> UserOut:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise HTTPException(status_code=401, detail="Belum masuk. Silakan login terlebih dahulu.")
    session = await db.sessions.find_one({"token": token})
    if not session or _naive_to_utc(session["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sesi telah berakhir. Silakan login kembali.")
    user = await db.users.find_one({"id": session["user_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="Akun tidak ditemukan.")
    return UserOut(**user)


@router.post("/register", response_model=UserOut)
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="Email sudah terdaftar. Silakan masuk.")
    user = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "school": payload.school,
        "nip": payload.nip,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(user)
    await _start_session(response, user["id"])
    return UserOut(**user)


@router.post("/login", response_model=UserOut)
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah.")
    await _start_session(response, user["id"])
    return UserOut(**user)


@router.get("/me", response_model=UserOut)
async def me(user: UserOut = Depends(get_current_user)):
    return user


@router.post("/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get(SESSION_COOKIE)
    if token:
        await db.sessions.delete_one({"token": token})
    response.delete_cookie(key=SESSION_COOKIE, path="/")
    return {"ok": True}
