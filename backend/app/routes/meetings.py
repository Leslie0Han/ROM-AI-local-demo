# -*- coding: utf-8 -*-
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.config import settings
from app.database import get_db
from app.mock_data import MOCK_MEETING_AGENDA, MOCK_MEETING_MINUTES
from app.services import call_deepseek_text

router = APIRouter(prefix="/api/projects/{project_id}/meetings", tags=["meetings"])


def _get_project_or_404(db: Session, project_id: str) -> models.Project:
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


@router.get("", response_model=list[schemas.MeetingOut])
def list_meetings(project_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    return list(db.scalars(
        select(models.Meeting)
        .where(models.Meeting.project_id == project_id)
        .order_by(models.Meeting.date.desc())
    ))


@router.post("", response_model=schemas.MeetingOut, status_code=201)
def create_meeting(project_id: str, payload: schemas.MeetingCreate, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    meeting = models.Meeting(project_id=project_id, **payload.model_dump())
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.get("/{meeting_id}", response_model=schemas.MeetingOut)
def get_meeting(project_id: str, meeting_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    meeting = db.scalar(select(models.Meeting).where(models.Meeting.id == meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="会议不存在")
    return meeting


@router.put("/{meeting_id}", response_model=schemas.MeetingOut)
def update_meeting(project_id: str, meeting_id: str, payload: schemas.MeetingUpdate, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    meeting = db.scalar(select(models.Meeting).where(models.Meeting.id == meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="会议不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(meeting, key, value)
    db.commit()
    db.refresh(meeting)
    return meeting


@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(project_id: str, meeting_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    meeting = db.scalar(select(models.Meeting).where(models.Meeting.id == meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="会议不存在")
    db.delete(meeting)
    db.commit()


@router.post("/{meeting_id}/generate-minutes")
async def generate_minutes(project_id: str, meeting_id: str, db: Session = Depends(get_db)):
    project = _get_project_or_404(db, project_id)
    meeting = db.scalar(select(models.Meeting).where(models.Meeting.id == meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="会议不存在")

    if settings.mock_mode:
        result = MOCK_MEETING_MINUTES
    else:
        prompt = (
            f"请为以下会议生成会议纪要，输出 JSON 格式，包含 summary、key_decisions、todos、next_meeting 字段。\n\n"
            f"项目：{project.name}\n"
            f"会议标题：{meeting.title}\n"
            f"议程：{meeting.agenda}\n"
        )
        try:
            raw = await call_deepseek_text(
                prompt=prompt,
                system_prompt="你是建筑设计项目会议纪要助手。只输出 JSON，不要输出 Markdown。",
            )
            import re
            match = re.search(r"\{.*\}", raw, re.S)
            result = json.loads(match.group(0)) if match else MOCK_MEETING_MINUTES
        except Exception:
            result = MOCK_MEETING_MINUTES

    meeting.minutes = json.dumps(result, ensure_ascii=False)
    meeting.todos = json.dumps(result.get("todos", []), ensure_ascii=False)
    meeting.status = "completed"
    db.commit()
    db.refresh(meeting)
    return {"meeting_id": meeting.id, "minutes": result}


@router.post("/{meeting_id}/generate-agenda")
async def generate_agenda(project_id: str, meeting_id: str, db: Session = Depends(get_db)):
    project = _get_project_or_404(db, project_id)
    meeting = db.scalar(select(models.Meeting).where(models.Meeting.id == meeting_id))
    if not meeting:
        raise HTTPException(status_code=404, detail="会议不存在")

    if settings.mock_mode:
        result = MOCK_MEETING_AGENDA
    else:
        prompt = (
            f"请为以下会议生成议程，输出 JSON 格式，包含 title、items、total_duration_min 字段。\n\n"
            f"项目：{project.name}\n"
            f"会议标题：{meeting.title}\n"
        )
        try:
            raw = await call_deepseek_text(
                prompt=prompt,
                system_prompt="你是建筑设计项目会议议程助手。只输出 JSON，不要输出 Markdown。",
            )
            import re
            match = re.search(r"\{.*\}", raw, re.S)
            result = json.loads(match.group(0)) if match else MOCK_MEETING_AGENDA
        except Exception:
            result = MOCK_MEETING_AGENDA

    meeting.agenda = json.dumps(result, ensure_ascii=False)
    db.commit()
    db.refresh(meeting)
    return {"meeting_id": meeting.id, "agenda": result}
