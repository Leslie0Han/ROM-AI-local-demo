from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models
from app.config import settings
from app.database import get_db
from app.services import knowledge_stats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def dashboard(db: Session = Depends(get_db)):
    projects = list(db.scalars(select(models.Project).order_by(models.Project.updated_at.desc()).limit(5)))
    reports = list(db.scalars(select(models.ProjectReport).order_by(models.ProjectReport.created_at.desc()).limit(5)))
    agent_runs = list(db.scalars(select(models.AgentRun).order_by(models.AgentRun.created_at.desc()).limit(5)))
    employees = list(db.scalars(select(models.DigitalEmployee).limit(8)))
    return {
        "mock_mode": settings.mock_mode,
        "project_count": db.scalar(select(func.count(models.Project.id))) or 0,
        "recent_projects": [
            {"id": item.id, "name": item.name, "city": item.city, "phase": item.phase, "status": item.status}
            for item in projects
        ],
        "knowledge": knowledge_stats(db),
        "recent_reports": [
            {"id": item.id, "project_id": item.project_id, "report_type": item.report_type, "mode": item.mode, "created_at": item.created_at}
            for item in reports
        ],
        "recent_agent_runs": [
            {"id": item.id, "project_id": item.project_id, "agent_id": item.agent_id, "status": item.status, "created_at": item.created_at}
            for item in agent_runs
        ],
        "digital_employees": [
            {"id": item.id, "name": item.name, "role": item.role, "avatar": item.avatar, "status": item.status, "workload": item.workload}
            for item in employees
        ],
    }
