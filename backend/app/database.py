from pathlib import Path
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import BASE_DIR, settings


def _sqlite_path_from_url(url: str) -> Optional[Path]:
    if not url.startswith("sqlite:///"):
        return None
    raw = url.replace("sqlite:///", "", 1)
    path = Path(raw)
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.resolve()


sqlite_path = _sqlite_path_from_url(settings.database_url)
if sqlite_path:
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()


def _ensure_sqlite_columns() -> None:
    if not settings.database_url.startswith("sqlite"):
        return
    additions = {
        "project_tasks": {
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
            "updated_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
            "assignee_type": "VARCHAR DEFAULT ''",
            "assignee_id": "VARCHAR DEFAULT ''",
            "assignee_name": "VARCHAR DEFAULT ''",
        },
        "knowledge_references": {
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        "project_files": {
            "analysis_status": "VARCHAR DEFAULT 'pending'",
            "analysis_batch_id": "VARCHAR DEFAULT ''",
            "analyzed_at": "DATETIME",
        },
        "project_meetings": {
            "updated_at": "DATETIME",
        },
        "meetings": {
            "date": "DATETIME",
            "minutes": "TEXT DEFAULT ''",
            "todos": "TEXT DEFAULT '[]'",
            "recording_url": "VARCHAR DEFAULT ''",
            "transcript": "TEXT DEFAULT ''",
            "summary": "TEXT DEFAULT ''",
            "mindmap_json": "TEXT DEFAULT '{}'",
            "next_actions_json": "TEXT DEFAULT '[]'",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        "skill_cards": {
            "updated_at": "DATETIME",
            "input_data": "TEXT DEFAULT '{}'",
            "output_data": "TEXT DEFAULT ''",
            "input_json": "TEXT DEFAULT '{}'",
            "output_json": "TEXT DEFAULT '{}'",
            "markdown": "TEXT DEFAULT ''",
            "source": "VARCHAR DEFAULT ''",
            "created_by": "VARCHAR DEFAULT 'user'",
            "completed_at": "DATETIME",
        },
        "team_members": {
            "created_at": "DATETIME",
        },
        "team_assignments": {
            "member_id": "VARCHAR DEFAULT ''",
            "member_type": "VARCHAR DEFAULT 'human'",
            "member_name": "VARCHAR DEFAULT ''",
            "role": "VARCHAR DEFAULT ''",
            "responsibilities": "TEXT DEFAULT ''",
            "created_at": "DATETIME DEFAULT CURRENT_TIMESTAMP",
        },
        "inbox_items": {
            "file_hash": "VARCHAR DEFAULT ''",
            "duplicate_scope": "VARCHAR DEFAULT ''",
            "duplicate_project_file_id": "VARCHAR DEFAULT ''",
            "duplicate_knowledge_file_id": "VARCHAR DEFAULT ''",
            "recommended_action": "VARCHAR DEFAULT ''",
            "recommend_knowledge_reason": "TEXT DEFAULT ''",
            "archive_group": "VARCHAR DEFAULT '待确认'",
        },
    }
    with engine.begin() as conn:
        for table, columns in additions.items():
            existing = {row[1] for row in conn.exec_driver_sql(f"PRAGMA table_info({table})")}
            if not existing:
                continue
            for name, definition in columns.items():
                if name not in existing:
                    conn.exec_driver_sql(f"ALTER TABLE {table} ADD COLUMN {name} {definition}")
        conn.exec_driver_sql(
            """
            UPDATE project_files
            SET analysis_status = 'analyzed',
                analyzed_at = (
                    SELECT MAX(project_reports.created_at)
                    FROM project_reports
                    WHERE project_reports.project_id = project_files.project_id
                      AND project_reports.report_type = 'startup_analysis'
                )
            WHERE analysis_status = 'pending'
              AND parse_status = 'parsed'
              AND EXISTS (
                    SELECT 1
                    FROM project_reports
                    WHERE project_reports.project_id = project_files.project_id
                      AND project_reports.report_type = 'startup_analysis'
                      AND project_reports.created_at >= project_files.created_at
              )
            """
        )
