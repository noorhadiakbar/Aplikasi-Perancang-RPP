"""Perangkat pembelajaran document models (mirrored by TS interfaces in frontend/src/lib/types.ts)."""

import uuid
from datetime import datetime, timezone

from pydantic import BaseModel, Field

DOC_TYPES = ("modul_ajar", "rpp", "atp", "kktp")


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class SyntaxStep(BaseModel):
    phase: str
    description: str = ""
    duration_min: int | None = None


class ATPEntry(BaseModel):
    order: int
    objective: str
    content: str = ""


class KKTPInterval(BaseModel):
    range_label: str
    description: str


class DocumentIn(BaseModel):
    """Create/update body — every pedagogical field has a default, so PUT can be partial."""

    doc_type: str = "modul_ajar"
    title: str = ""
    curriculum: str = "merdeka"
    level: str = "SD"
    grade: str = ""
    phase: str = ""
    subject: str = ""
    time_allocation: str = ""
    academic_year: str = ""
    teacher_name: str = ""
    teacher_nip: str = ""
    school_name: str = ""
    approach: str = ""
    model: str = ""
    method: str = ""
    strategy: str = ""
    cp: str = ""
    objectives: list[str] = Field(default_factory=list)
    dimensions: list[str] = Field(default_factory=list)
    meaningful_understanding: str = ""
    trigger_questions: str = ""
    intro_activities: str = ""
    core_activities: list[SyntaxStep] = Field(default_factory=list)
    closing_activities: str = ""
    diagnostic_assessment: str = ""
    formative_assessment: str = ""
    summative_assessment: str = ""
    media: str = ""
    sources: str = ""
    remedial: str = ""
    enrichment: str = ""
    kkm_score: int | None = None
    kktp_intervals: list[KKTPInterval] = Field(default_factory=list)
    atp_entries: list[ATPEntry] = Field(default_factory=list)
    status: str = "draft"


class LessonDocument(DocumentIn):
    id: str = Field(default_factory=_uuid)
    owner_id: str
    created_at: datetime = Field(default_factory=_now_utc)
    updated_at: datetime = Field(default_factory=_now_utc)
