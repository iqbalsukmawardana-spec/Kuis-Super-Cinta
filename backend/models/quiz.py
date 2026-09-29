"""Pydantic v2 models for the quiz content — the source of truth for the /api/quiz routes.

Every model here has a hand-written TS mirror in frontend/src/lib/types.ts — keep the pair
in sync in the same edit.
"""

from uuid import uuid4

from pydantic import BaseModel, Field


class MemoryPhoto(BaseModel):
    url: str
    caption: str = ""
    date_label: str = ""


class LetterContent(BaseModel):
    title: str = "Surat Untukmu"
    greeting: str = ""
    body: str = ""
    signoff: str = ""


class TitleTier(BaseModel):
    min_score: int
    max_score: int
    emoji: str
    title: str
    message: str


class QuizConfig(BaseModel):
    secret_word: str = "Sovers"
    gate_active: bool = True
    gate_hint: str = "Kata panggilan untuk fans kamu pas udah jadi artis"
    audio_url: str = ""
    hero_image_url: str = ""
    letter: LetterContent = Field(default_factory=LetterContent)
    titles: list[TitleTier] = Field(default_factory=list)
    photos: list[MemoryPhoto] = Field(default_factory=list)


class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: uuid4().hex)
    order: int
    question: str
    options: list[str]
    correct_index: int
    fun_fact: str = ""


class QuizMeta(BaseModel):
    """Safe-to-fetch preamble: no answers, no letter — tells the client whether the gate is on."""

    gate_active: bool
    gate_hint: str = ""
    ready: bool = True


class UnlockRequest(BaseModel):
    secret_word: str = ""


class QuizContent(BaseModel):
    """Full payload returned after the gate opens."""

    questions: list[QuizQuestion]
    config: QuizConfig


class ContentUpdateRequest(BaseModel):
    """Edit quiz content without touching code. Authorized by the current secret word."""

    secret_word: str
    config: QuizConfig | None = None
    questions: list[QuizQuestion] | None = None


class ConfigPatch(BaseModel):
    """Partial config edit — only the fields you send are changed."""

    secret_word: str | None = None
    gate_active: bool | None = None
    gate_hint: str | None = None
    audio_url: str | None = None
    hero_image_url: str | None = None
    letter: LetterContent | None = None
    titles: list[TitleTier] | None = None
    photos: list[MemoryPhoto] | None = None


class ContentPatchRequest(BaseModel):
    """PATCH /api/quiz/content — change only what you send. Authorized by the current secret word."""

    secret_word: str
    config: ConfigPatch | None = None
    questions: list[QuizQuestion] | None = None
