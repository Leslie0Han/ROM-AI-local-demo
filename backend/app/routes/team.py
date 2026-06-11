# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
router = APIRouter(tags=["team"])


def _get_project_or_404(db: Session, project_id: str) -> models.Project:
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


@router.get("/api/projects/{project_id}/team", response_model=list[schemas.TeamAssignmentOut])
def get_project_team(project_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    return list(db.scalars(
        select(models.TeamAssignment)
        .where(models.TeamAssignment.project_id == project_id)
        .order_by(models.TeamAssignment.created_at)
    ))


@router.post("/api/projects/{project_id}/team", response_model=schemas.TeamAssignmentOut, status_code=201)
def add_team_member(project_id: str, payload: schemas.TeamAssignmentCreate, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    assignment = db.scalar(
        select(models.TeamAssignment).where(
            models.TeamAssignment.project_id == project_id,
            models.TeamAssignment.member_id == payload.member_id,
            models.TeamAssignment.member_type == payload.member_type,
        )
    )
    if assignment:
        for key, value in payload.model_dump().items():
            setattr(assignment, key, value)
    else:
        assignment = models.TeamAssignment(project_id=project_id, **payload.model_dump())
        db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.put("/api/projects/{project_id}/team/{assignment_id}", response_model=schemas.TeamAssignmentOut)
def update_team_member(
    project_id: str,
    assignment_id: str,
    payload: schemas.TeamAssignmentUpdate,
    db: Session = Depends(get_db),
):
    _get_project_or_404(db, project_id)
    assignment = db.scalar(select(models.TeamAssignment).where(models.TeamAssignment.id == assignment_id))
    if not assignment:
        raise HTTPException(status_code=404, detail="团队分工记录不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(assignment, key, value)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/api/projects/{project_id}/team/{assignment_id}", status_code=204)
def remove_team_member(project_id: str, assignment_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    assignment = db.scalar(select(models.TeamAssignment).where(models.TeamAssignment.id == assignment_id))
    if not assignment:
        raise HTTPException(status_code=404, detail="团队分工记录不存在")
    db.delete(assignment)
    db.commit()


@router.get("/api/team/members")
def get_all_members(db: Session = Depends(get_db)):
    """获取所有成员（人类 + AI数字员工）"""
    human_members = [
        {
            "id": member.id,
            "name": member.name,
            "type": "human",
            "role": member.role,
            "skills": member.skills,
            "status": member.status,
            "workload": member.workload,
        }
        for member in db.scalars(select(models.TeamMember).order_by(models.TeamMember.name))
    ]
    ai_members = list(db.scalars(select(models.DigitalEmployee).order_by(models.DigitalEmployee.name)))
    ai_list = [
        {
            "id": e.id,
            "name": e.name,
            "type": "digital_employee",
            "role": e.role,
            "skills": e.skills,
            "status": e.status,
            "workload": e.workload,
        }
        for e in ai_members
    ]
    return {"members": human_members + ai_list}


@router.put("/api/team/members/{member_id}", response_model=schemas.TeamMemberOut)
def update_global_team_member(member_id: str, payload: schemas.TeamMemberUpdate, db: Session = Depends(get_db)):
    member = db.get(models.TeamMember, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="真实员工不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(member, key, value or "")
    db.commit()
    db.refresh(member)
    return member


@router.get("/api/network/members/{member_type}/{member_id}/workload")
def get_network_member_workload(member_type: str, member_id: str, db: Session = Depends(get_db)):
    if member_type not in {"human", "digital_employee"}:
        raise HTTPException(status_code=400, detail="成员类型不支持")
    assignments = list(
        db.scalars(
            select(models.TeamAssignment)
            .where(
                models.TeamAssignment.member_id == member_id,
                models.TeamAssignment.member_type == member_type,
            )
            .order_by(models.TeamAssignment.created_at.desc())
        )
    )
    project_ids = [assignment.project_id for assignment in assignments]
    projects = {
        project.id: project
        for project in db.scalars(select(models.Project).where(models.Project.id.in_(project_ids))) if project_ids
    }
    tasks = list(
        db.scalars(
            select(models.ProjectTask)
            .where(
                models.ProjectTask.assignee_id == member_id,
                models.ProjectTask.assignee_type == member_type,
            )
            .order_by(models.ProjectTask.updated_at.desc())
        )
    )
    return {
        "member_id": member_id,
        "member_type": member_type,
        "project_count": len({assignment.project_id for assignment in assignments}),
        "task_count": len(tasks),
        "projects": [
            {
                "project_id": assignment.project_id,
                "project_name": projects.get(assignment.project_id).name if projects.get(assignment.project_id) else "",
                "role": assignment.role,
                "responsibilities": assignment.responsibilities or "",
            }
            for assignment in assignments
        ],
        "tasks": [
            {
                "id": task.id,
                "project_id": task.project_id,
                "project_name": projects.get(task.project_id).name if projects.get(task.project_id) else "",
                "task_name": task.task_name,
                "status": task.status,
                "priority": task.priority,
            }
            for task in tasks
        ],
    }
