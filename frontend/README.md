# RMO-Ai Frontend

这是 RMO-Ai 项目智能中心的 React + Vite 前端。当前页面已经从演示型首页扩展为项目工作台，连接 `C:\Rmomo-Ai\backend` 的 FastAPI 后端。

## 启动

```powershell
cd C:\Rmomo-Ai\Rmo-AI项目智能中心提议\app
npm install
npm run dev -- --host 127.0.0.1 --port 5175
```

访问：

```text
http://127.0.0.1:5175/
```

## 页面

```text
/             仪表盘
/projects     项目工作台
/projects/new 新建项目
/projects/:id 项目详情、上传、解析、分析、团队配置
/knowledge    建筑知识库扫描与问答
/agents       AI 代理
/designers    数字设计员工
/settings     后端与 DeepSeek 配置状态
/landing      原展示首页
```

## 后端地址

默认 API 地址写在：

```text
src/lib/projectsApi.ts
```

当前默认值：

```text
http://127.0.0.1:8000/api
```

知识库页支持两种本地资料接入方式：

```text
后端路径扫描：输入 C:\Users\yz_ya\Documents\Obsidian Vault\Obj-哈尔滨 等路径，由 FastAPI 读取。
网页文件夹上传：点击“选择文件夹并索引”，由浏览器把文件夹内支持的文件上传到本地后端索引。
```

## 构建检查

```powershell
npm run build
```
