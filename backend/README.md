# RMO-Ai Backend

这是 RMO-Ai 项目智能中心的新本地后端，使用 FastAPI、SQLite、SQLAlchemy。当前已支持项目建档、资料上传解析、项目分析、知识库扫描/问答、AI 代理、数字设计员工与仪表盘数据。

## Windows PowerShell 启动

```powershell
cd C:\Rmomo-Ai\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

如果只想使用当前系统 Python，也可以跳过 venv：

```powershell
cd C:\Rmomo-Ai\backend
C:\ServBay\packages\python\current\python.exe -m pip install -r requirements.txt
C:\ServBay\packages\python\current\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## 环境变量

复制模板：

```powershell
copy .env.example .env
```

常用配置：

```text
DATABASE_URL=sqlite:///./data/rmo_ai.db
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEFAULT_VAULT_PATH=C:\Users\yz_ya\Documents\Obsidian Vault
UPLOAD_ROOT=C:\Rmomo-Ai\backend\uploads
CLOUD_UPLOAD_ENABLED=false
CLOUD_UPLOAD_ROOT=C:\Rmomo-Ai\backend\cloud
```

未配置 `DEEPSEEK_API_KEY` 时，`/api/settings/status` 会返回 `mock_mode=true`，AI 分析接口会使用明确标记的模拟结果。

## 主要 API

```text
GET  /api/health
GET  /api/settings/status
GET  /api/dashboard

GET  /api/projects
POST /api/projects
GET  /api/projects/{project_id}
POST /api/projects/{project_id}/upload
POST /api/projects/{project_id}/parse
POST /api/projects/{project_id}/analyze
POST /api/projects/{project_id}/team-plan

POST /api/knowledge/scan
POST /api/knowledge/upload
POST /api/knowledge/reindex
POST /api/knowledge/incremental
POST /api/knowledge/clear
GET  /api/knowledge/stats
GET  /api/knowledge/tree
GET  /api/knowledge/recent-files
POST /api/knowledge/ask

GET  /api/agents
POST /api/agents/{agent_id}/run
GET  /api/designers/digital-employees
```

## Cloud process mirror

Set `CLOUD_UPLOAD_ENABLED=true` to mirror future process content into `CLOUD_UPLOAD_ROOT`.
The local SQLite and `UPLOAD_ROOT` flow remains unchanged. The mirror currently writes:

- `projects/{project_id}/uploads/`: uploaded project source files and metadata
- `projects/{project_id}/process/parsed_text/`: parsed file text as Markdown
- `projects/{project_id}/process/reports/`: analysis reports as Markdown and JSON
- `projects/{project_id}/process/agent_runs/`: agent run inputs and outputs
- `knowledge/{source_label}/`: browser-uploaded knowledge files and metadata

`CLOUD_UPLOAD_ROOT` can be a local cloud-sync folder now, and the implementation in `app/cloud.py` can later be replaced by an OSS/S3/COS/Drive SDK adapter.
