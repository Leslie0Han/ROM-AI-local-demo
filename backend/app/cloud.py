import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.config import settings


def cloud_enabled() -> bool:
    return settings.cloud_upload_enabled and bool(str(settings.cloud_upload_root).strip())


def cloud_root_path() -> Path:
    path = Path(settings.cloud_upload_root)
    if not path.is_absolute():
        path = settings.upload_root_path / path
    return path.resolve()


def ensure_cloud_root() -> None:
    if cloud_enabled():
        cloud_root_path().mkdir(parents=True, exist_ok=True)


def safe_name(value: str) -> str:
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]+', "_", value).strip(" ._")
    return cleaned or "untitled"


def timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def project_cloud_dir(project_id: str) -> Path:
    path = cloud_root_path() / "projects" / safe_name(project_id)
    path.mkdir(parents=True, exist_ok=True)
    return path


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def mirror_project_file(project_id: str, source: Path, metadata: dict[str, Any]) -> str:
    if not cloud_enabled():
        return ""
    target_dir = project_cloud_dir(project_id) / "uploads"
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / safe_name(source.name)
    shutil.copy2(source, target)
    write_json(
        target.with_suffix(target.suffix + ".metadata.json"),
        {
            "kind": "project_file",
            "project_id": project_id,
            "mirrored_at": timestamp(),
            "cloud_path": str(target),
            "source_path": str(source),
            **metadata,
        },
    )
    return str(target)


def mirror_project_parse(project_id: str, file_id: str, filename: str, parsed_text: str, status: str) -> str:
    if not cloud_enabled():
        return ""
    target = project_cloud_dir(project_id) / "process" / "parsed_text" / f"{safe_name(file_id)}.md"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(
        "\n".join(
            [
                "---",
                f"kind: project_parse",
                f"project_id: {project_id}",
                f"file_id: {file_id}",
                f"filename: {filename}",
                f"status: {status}",
                f"mirrored_at: {timestamp()}",
                "---",
                "",
                parsed_text or "",
            ]
        ),
        encoding="utf-8",
    )
    return str(target)


def mirror_project_report(project_id: str, report_id: str, markdown: str, payload: dict[str, Any]) -> str:
    if not cloud_enabled():
        return ""
    base = project_cloud_dir(project_id) / "process" / "reports" / safe_name(report_id)
    md_path = base.with_suffix(".md")
    json_path = base.with_suffix(".json")
    md_path.parent.mkdir(parents=True, exist_ok=True)
    md_path.write_text(markdown or "", encoding="utf-8")
    write_json(
        json_path,
        {
            "kind": "project_report",
            "project_id": project_id,
            "report_id": report_id,
            "mirrored_at": timestamp(),
            "payload": payload,
        },
    )
    return str(md_path)


def mirror_agent_run(project_id: str, run_id: str, agent_id: str, input_context: str, output_json: str, status: str) -> str:
    if not cloud_enabled():
        return ""
    target = project_cloud_dir(project_id) / "process" / "agent_runs" / f"{safe_name(run_id)}.json"
    write_json(
        target,
        {
            "kind": "agent_run",
            "project_id": project_id,
            "run_id": run_id,
            "agent_id": agent_id,
            "status": status,
            "mirrored_at": timestamp(),
            "input_context": input_context,
            "output_json": output_json,
        },
    )
    return str(target)


def mirror_knowledge_upload(source_label: str, relative_path: str, source: Path, metadata: dict[str, Any]) -> str:
    if not cloud_enabled():
        return ""
    target = cloud_root_path() / "knowledge" / safe_name(source_label) / safe_name(relative_path.replace("/", "_"))
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    write_json(
        target.with_suffix(target.suffix + ".metadata.json"),
        {
            "kind": "knowledge_upload",
            "source_label": source_label,
            "relative_path": relative_path,
            "mirrored_at": timestamp(),
            "cloud_path": str(target),
            "source_path": str(source),
            **metadata,
        },
    )
    return str(target)
