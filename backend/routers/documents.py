"""CRUD for perangkat pembelajaran documents, scoped to the logged-in guru."""

import re
from datetime import datetime, timezone

from pymongo import DESCENDING
from fastapi import APIRouter, Depends, HTTPException, Response

from lib.db import db
from models.auth import UserOut
from models.document import DOC_TYPES, DocumentIn, LessonDocument
from routers.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["documents"])


def _clean(doc: dict) -> dict:
    """Drop Mongo's _id and make naive datetimes aware-UTC so JS parses them correctly."""
    doc.pop("_id", None)
    for key in ("created_at", "updated_at"):
        value = doc.get(key)
        if isinstance(value, datetime) and value.tzinfo is None:
            doc[key] = value.replace(tzinfo=timezone.utc)
    return doc


def _now() -> datetime:
    return datetime.now(timezone.utc)


@router.get("", response_model=list[LessonDocument])
async def list_documents(
    doc_type: str | None = None,
    level: str | None = None,
    q: str | None = None,
    user: UserOut = Depends(get_current_user),
):
    query: dict = {"owner_id": user.id}
    if doc_type:
        if doc_type not in DOC_TYPES:
            raise HTTPException(status_code=422, detail="Jenis dokumen tidak dikenal.")
        query["doc_type"] = doc_type
    if level:
        query["level"] = level
    if q:
        query["title"] = {"$regex": re.escape(q), "$options": "i"}
    docs = await db.documents.find(query).sort("updated_at", DESCENDING).to_list(500)
    return [LessonDocument(**_clean(d)) for d in docs]


@router.post("", response_model=LessonDocument, status_code=201)
async def create_document(payload: DocumentIn, user: UserOut = Depends(get_current_user)):
    if payload.doc_type not in DOC_TYPES:
        raise HTTPException(status_code=422, detail="Jenis dokumen tidak dikenal.")
    document = LessonDocument(**payload.model_dump(), owner_id=user.id)
    await db.documents.insert_one(document.model_dump())
    return document


async def _get_owned_or_404(document_id: str, user: UserOut) -> dict:
    doc = await db.documents.find_one({"id": document_id})
    if not doc or doc.get("owner_id") != user.id:
        raise HTTPException(status_code=404, detail="Dokumen tidak ditemukan.")
    return doc


@router.get("/{document_id}", response_model=LessonDocument)
async def get_document(document_id: str, user: UserOut = Depends(get_current_user)):
    return LessonDocument(**_clean(await _get_owned_or_404(document_id, user)))


@router.put("/{document_id}", response_model=LessonDocument)
async def update_document(
    document_id: str, payload: DocumentIn, user: UserOut = Depends(get_current_user)
):
    await _get_owned_or_404(document_id, user)
    updates = payload.model_dump(exclude_unset=True)
    if "doc_type" in updates and updates["doc_type"] not in DOC_TYPES:
        raise HTTPException(status_code=422, detail="Jenis dokumen tidak dikenal.")
    updates["updated_at"] = _now()
    await db.documents.update_one({"id": document_id}, {"$set": updates})
    doc = await db.documents.find_one({"id": document_id})
    return LessonDocument(**_clean(doc))


@router.delete("/{document_id}")
async def delete_document(
    document_id: str, user: UserOut = Depends(get_current_user)
):
    await _get_owned_or_404(document_id, user)
    await db.documents.delete_one({"id": document_id})
    return Response(status_code=204)
