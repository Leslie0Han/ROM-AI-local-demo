# -*- coding: utf-8 -*-
"""集中管理所有 Mock 响应数据。"""

MOCK_TECH_POINTS = [
    {"dimension": "日照分析", "level": "high", "content": "项目位于严寒地区，大寒日日照需满足>=3h，需关注南向栋间距计算...", "risk": "中等"},
    {"dimension": "退界要求", "level": "medium", "content": "用地红线退道路边界>=5m，退相邻地块>=3m...", "risk": "低"},
    {"dimension": "面积配比", "level": "high", "content": "计容面积约12万㎡，地下车库配比1:1.2...", "risk": "高"},
    {"dimension": "消防设计", "level": "medium", "content": "高层住宅>=54m需设置避难层，消防车道环通...", "risk": "中等"},
    {"dimension": "规划条件", "level": "high", "content": "容积率2.5，建筑密度<=25%，绿地率>=35%...", "risk": "低"},
    {"dimension": "报批风险", "level": "medium", "content": "日照不满足可能导致方案退回，建议提前与规划局沟通...", "risk": "高"},
]

MOCK_MEETING_MINUTES = {
    "summary": "本次会议讨论了项目总图方案调整...",
    "key_decisions": ["确定南区高层布局为品字形", "售楼处位置调整至场地东侧"],
    "todos": [
        {"task": "调整总图方案南区布局", "assignee": "张工", "due_date": "2026-06-15"},
        {"task": "完成日照分析复核", "assignee": "李工", "due_date": "2026-06-12"},
    ],
    "next_meeting": "2026-06-16 14:00",
}

MOCK_MEETING_AGENDA = {
    "title": "项目总图方案评审会",
    "items": [
        {"order": 1, "topic": "总图方案比选", "duration_min": 30, "presenter": "主创建筑师"},
        {"order": 2, "topic": "日照分析结果讨论", "duration_min": 20, "presenter": "技术负责人"},
        {"order": 3, "topic": "示范区范围确认", "duration_min": 15, "presenter": "项目经理"},
        {"order": 4, "topic": "下一步计划与分工", "duration_min": 15, "presenter": "项目经理"},
    ],
    "total_duration_min": 80,
}

MOCK_TASK_BREAKDOWN = [
    {"title": "总图方案深化", "priority": "high", "assignee_type": "human", "due_days": 7},
    {"title": "立面风格确定", "priority": "high", "assignee_type": "human", "due_days": 10},
    {"title": "户型优化（160㎡）", "priority": "medium", "assignee_type": "human", "due_days": 14},
    {"title": "景观概念方案", "priority": "medium", "assignee_type": "human", "due_days": 21},
    {"title": "技术指标复核", "priority": "high", "assignee_type": "ai", "due_days": 3},
    {"title": "竞品资料收集整理", "priority": "low", "assignee_type": "ai", "due_days": 5},
]

MOCK_PPT_STRUCTURE = {
    "title": "群力西三地块方案汇报",
    "sections": [
        {"page": 1, "title": "项目概述", "content": "区位分析、用地条件、规划指标"},
        {"page": 2, "title": "设计理念", "content": "设计愿景、核心策略"},
        {"page": 3, "title": "总图方案", "content": "规划布局、交通组织、景观体系"},
        {"page": 4, "title": "建筑设计", "content": "立面风格、户型配比、标准层"},
        {"page": 5, "title": "示范区设计", "content": "示范区范围、动线设计、景观节点"},
        {"page": 6, "title": "技术专篇", "content": "日照、消防、人防、绿建"},
    ],
}

MOCK_KNOWLEDGE_CHAT_ANSWER = {
    "answer": "根据项目知识库，关于该问题的主要结论如下：\n1. 项目位于严寒地区，需重点控制日照间距。\n2. 南向栋间距需满足大寒日>=3h日照标准。\n3. 建议提前与规划局沟通日照计算边界条件。\n\n以上为 Mock 回答，配置 DeepSeek API 后将生成完整分析。",
    "sources": ["规划条件摘要.md", "日照分析要点.md"],
}

MOCK_BOSS_DASHBOARD = {
    "project_summary": {"total": 3, "active": 2, "completed": 1},
    "task_summary": {"total": 18, "todo": 8, "in_progress": 6, "done": 4},
    "meeting_summary": {"total": 5, "scheduled": 2, "completed": 3},
    "recent_activities": [
        {"type": "meeting", "title": "总图方案评审会", "time": "2026-06-09 14:00"},
        {"type": "task", "title": "总图方案深化", "time": "2026-06-08"},
        {"type": "report", "title": "项目分析报告", "time": "2026-06-07"},
    ],
    "risk_alerts": [
        {"level": "high", "message": "日照分析可能不满足规范要求"},
        {"level": "medium", "message": "报批时间节点临近"},
    ],
}

MOCK_TEAM_MEMBERS = [
    {"id": "human-1", "name": "张工", "type": "human", "role": "总图负责人"},
    {"id": "human-2", "name": "李工", "type": "human", "role": "立面负责人"},
    {"id": "human-3", "name": "王工", "type": "human", "role": "项目经理"},
    {"id": "ai-pm", "name": "AI项目经理", "type": "ai", "role": "项目负责人 / PM"},
    {"id": "ai-mp", "name": "AI总图助理", "type": "ai", "role": "总图负责人"},
    {"id": "ai-fc", "name": "AI立面助理", "type": "ai", "role": "立面负责人"},
    {"id": "ai-rp", "name": "AI汇报助理", "type": "ai", "role": "汇报助理"},
    {"id": "ai-kb", "name": "AI资料管理员", "type": "ai", "role": "资料管理员"},
]
