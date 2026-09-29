"""Quiz content routes — served from MongoDB so soal/surat/media can be edited without code."""

import logging

from fastapi import APIRouter, HTTPException

from lib.db import db
from models.quiz import (
    ConfigPatch,
    ContentPatchRequest,
    ContentUpdateRequest,
    QuizConfig,
    QuizContent,
    QuizMeta,
    QuizQuestion,
    UnlockRequest,
)

router = APIRouter(prefix="/quiz", tags=["quiz"])
logger = logging.getLogger(__name__)


def _norm(word: str) -> str:
    return word.strip().lower()


async def _load_config() -> QuizConfig:
    doc = await db.quiz_config.find_one({"id": "main"})
    if not doc:
        raise HTTPException(
            status_code=404,
            detail="Konten kuis belum di-seed. Jalankan: cd /app/backend && python seed.py",
        )
    doc.pop("_id", None)
    doc.pop("id", None)
    return QuizConfig(**doc)


async def _load_questions() -> list[QuizQuestion]:
    docs = await db.quiz_questions.find().sort("order", 1).to_list(100)
    docs = [{**d, "_id": None} for d in docs]
    return [QuizQuestion(**{k: v for k, v in d.items() if k != "_id"}) for d in docs]


async def _load_content() -> QuizContent:
    config = await _load_config()
    return QuizContent(questions=await _load_questions(), config=config)


@router.get("/meta", response_model=QuizMeta)
async def quiz_meta() -> QuizMeta:
    try:
        config = await _load_config()
    except HTTPException:
        return QuizMeta(gate_active=True, gate_hint="", ready=False)
    return QuizMeta(gate_active=config.gate_active, gate_hint=config.gate_hint, ready=True)


@router.post("/unlock", response_model=QuizContent)
async def unlock(request: UnlockRequest) -> QuizContent:
    config = await _load_config()
    if config.gate_active and _norm(request.secret_word) != _norm(config.secret_word):
        raise HTTPException(status_code=403, detail="Hmm, bukan kata itu 😜 Coba lagi ya!")
    return await _load_content()


@router.patch("/content", response_model=QuizContent)
async def patch_content(request: ContentPatchRequest) -> QuizContent:
    """Partial edit: ganti satu bagian saja (surat, foto, kata rahasia, dll) tanpa kirim semuanya."""
    current = await _load_config()
    if _norm(request.secret_word) != _norm(current.secret_word):
        raise HTTPException(status_code=403, detail="Kata rahasia salah — konten tidak diubah.")
    if request.config is not None:
        updates = request.config.model_dump(exclude_unset=True, exclude_none=True)
        updates.pop("secret_word", None)  # handled explicitly below, never blanked by accident
        if updates:
            await db.quiz_config.update_one({"id": "main"}, {"$set": updates})
        new_secret = request.config.secret_word
        if new_secret is not None and new_secret.strip():
            await db.quiz_config.update_one(
                {"id": "main"}, {"$set": {"secret_word": new_secret.strip()}}
            )
    if request.questions is not None:
        await db.quiz_questions.delete_many({})
        if request.questions:
            await db.quiz_questions.insert_many([q.model_dump() for q in request.questions])
    return await _load_content()


@router.put("/content", response_model=QuizContent)
async def update_content(request: ContentUpdateRequest) -> QuizContent:
    current = await _load_config()
    if _norm(request.secret_word) != _norm(current.secret_word):
        raise HTTPException(status_code=403, detail="Kata rahasia salah — konten tidak diubah.")
    if request.config is not None:
        await db.quiz_config.replace_one(
            {"id": "main"}, {**request.config.model_dump(), "id": "main"}, upsert=True
        )
    if request.questions is not None:
        await db.quiz_questions.delete_many({})
        if request.questions:
            await db.quiz_questions.insert_many([q.model_dump() for q in request.questions])
    return await _load_content()
