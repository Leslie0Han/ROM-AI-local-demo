# -*- coding: utf-8 -*-
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/projects/{project_id}/tasks", tags=["tasks"])


def _get_project_or_404(db: Session, project_id: str) -> models.Project:
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    project_id: str,
    status: Optional[str] = Query(None, description="按状态过滤: todo / in_progress / done"),
    db: Session = Depends(get_db),
):
    _get_project_or_404(db, project_id)
    query = select(models.Task).where(models.Task.project_id == project_id)
    if status:
        query = query.where(models.Task.status == status)
    query = query.order_by(models.Task.created_at.desc())
    return list(db.scalars(query))


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(project_id: str, payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    task = models.Task(project_id=project_id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(project_id: str, task_id: str, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    task = db.scalar(select(models.Task).where(models.Task.id == task_id))
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(project_id: str, task_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    task = db.scalar(select(models.Task).where(models.Task.id == task_id))
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    db.delete(task)
    db.commit()
