# RMO-Ai Project Workspace

这是本地优先的 RMO-Ai 项目智能中心工作台。当前版本把前端网页原型接入了一个新的 FastAPI + SQLite 后端，支持项目建档、文件上传解析、项目分析、建筑知识库扫描、AI 代理运行、数字设计员工与团队配置。

## 目录结构

```text
C:\Rmomo-Ai
├─ backend                         # 新增 FastAPI 后端，默认端口 8000
├─ Rmo-AI项目智能中心提议\app        # React + Vite 前端，默认端口 5175
└─ agent-system                    # 既有后端，仍可用于旧知识库/生图能力
```

## 启动后端

```powershell
cd C:\Rmomo-Ai\backend
C:\ServBay\packages\python\current\python.exe -m pip install -r requirements.txt
C:\ServBay\packages\python\current\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

后台启动：

```powershell
Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c','cd /d C:\Rmomo-Ai\backend && C:\ServBay\packages\python\current\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000') -WindowStyle Hidden
```

## 启动前端

```powershell
cd C:\Rmomo-Ai\Rmo-AI项目智能中心提议\app
npm install
npm run dev -- --host 127.0.0.1 --port 5175
```

打开：

```text
http://127.0.0.1:5175/
```

## DeepSeek 配置

后端默认支持 mock 模式。如果没有配置 `DEEPSEEK_API_KEY`，项目分析与知识库问答会返回明确标记的模拟结果，不会伪装成真实 AI 回答。

复制环境变量模板：

```powershell
cd C:\Rmomo-Ai\backend
copy .env.example .env
```

在 `.env` 中填写：

```text
DEEPSEEK_API_KEY=你的密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

## 核心接口

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
GET  /api/projects/{project_id}/team-plan

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

## 注意

- 后端读取本地文件夹时由用户显式输入路径，前端普通网页不能直接获得完整 `C:\...` 路径。
- 网页端也提供文件夹上传索引：浏览器不能返回真实绝对路径，但可以把用户点选的文件夹内容上传到本地后端并进入知识库。
- 知识库扫描会递归读取指定文件夹，第一次扫描大型 Obsidian Vault 可能较慢。
- 当前阶段保留本地优先路线，数据默认落在 `C:\Rmomo-Ai\backend\data\rmo_ai.db`。
