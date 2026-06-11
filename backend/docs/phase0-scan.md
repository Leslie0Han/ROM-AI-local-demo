# Phase 0 Scan

## 当前结构

- 前端：`Rmo-AI项目智能中心提议/app`
- 技术栈：React + Vite + Tailwind CSS
- 路由：已安装并使用 `react-router` 的 `BrowserRouter`，当前 `App.tsx` 仍以单页板块为主
- 后端现状：已有 `agent-system` 用于知识库和 AI 设计生图；本次按新计划另建 `backend/`

## Phase 1-2 改造边界

- Phase 1：新增 `backend/`，提供 FastAPI、SQLite、健康检查、设置状态接口
- Phase 2：建立 Project 核心数据模型，提供项目列表、创建、详情接口，并在前端新增 `/projects`、`/projects/new`、`/projects/:id`
- 暂不执行 Phase 3 之后：不做上传、解析、DeepSeek 分析、知识库索引、AI 代理、设计师网络推荐
