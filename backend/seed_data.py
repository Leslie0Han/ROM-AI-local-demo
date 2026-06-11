# -*- coding: utf-8 -*-
"""
ROM-AI Demo 1.0 示例数据初始化脚本
运行方式：cd C:\Rmomo-Ai\backend && python seed_data.py
"""
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Ensure backend root is on sys.path
BACKEND_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import SessionLocal, init_db
from app.models import (
    Project,
    ProjectTask,
    Meeting,
    Task,
    SkillCard,
    TeamAssignment,
    TeamMember,
    DigitalEmployee,
)
from app.mock_data import (
    MOCK_TECH_POINTS,
    MOCK_MEETING_MINUTES,
    MOCK_MEETING_AGENDA,
    MOCK_TASK_BREAKDOWN,
    MOCK_PPT_STRUCTURE,
)


def _clear_all(db):
    """Delete all seed-able data (keep DigitalEmployee which is managed by ensure_digital_employees)."""
    for model in [
        TeamAssignment,
        SkillCard,
        Task,
        Meeting,
        ProjectTask,
        Project,
        TeamMember,
    ]:
        db.query(model).delete()
    db.commit()


def _seed_projects(db) -> dict:
    """Create sample projects, return {name: project_obj}."""
    projects_data = [
        {
            "name": "哈尔滨群力西三地块住宅项目",
            "city": "哈尔滨",
            "project_type": "住宅",
            "phase": "方案",
            "description": "位于哈尔滨群力西区，三地块联动开发，总建面约12万㎡。产品定位为城市改善型住宅，采用高层+洋房组合布局。打造高品质改善型住宅社区，融入寒地建筑特色，注重社区归属感和生活品质。高层+洋房组合，主力户型160-225㎡。",
            "status": "active",
        },
        {
            "name": "太原万科城市更新项目",
            "city": "太原",
            "project_type": "城市更新",
            "phase": "方案",
            "description": "城市核心区更新，保留历史文脉，打造商业+办公+文化复合体。总建面约8.5万㎡。",
            "status": "active",
        },
        {
            "name": "台州凤起云城4号地块",
            "city": "台州",
            "project_type": "住宅",
            "phase": "初设",
            "description": "保利品质住宅，原桩基利用，新旧规范过渡。总建面约6.2万㎡。",
            "status": "active",
        },
        {
            "name": "西安高新81亩地块",
            "city": "西安",
            "project_type": "住宅",
            "phase": "施工图",
            "description": "住宅项目，总建面约5.4万㎡，已完成施工图阶段。",
            "status": "completed",
        },
    ]
    result = {}
    for pd in projects_data:
        p = Project(**pd)
        db.add(p)
        result[pd["name"]] = p
    db.commit()
    # Refresh to get IDs
    for p in result.values():
        db.refresh(p)
    return result


def _seed_meetings(db, projects: dict):
    """Create sample meetings linked to 哈尔滨项目."""
    hrb = projects["哈尔滨群力西三地块住宅项目"]
    now = datetime.now()
    meetings_data = [
        {
            "title": "群力西项目方案启动会",
            "date": now - timedelta(days=7),
            "status": "completed",
            "agenda": "1. 项目背景介绍\n2. 用地条件解读\n3. 设计要求确认\n4. 工作计划安排",
            "minutes": "确定了南区高层品字形布局方案，售楼处位置调整至场地东侧入口处。总图方案需在6月15日前完成深化。",
            "todos": json.dumps([
                {"task": "总图方案南区布局深化", "assignee": "张工", "due_date": "2026-06-15"},
                {"task": "日照分析复核（大寒日）", "assignee": "李工", "due_date": "2026-06-12"},
                {"task": "售楼处概念方案", "assignee": "王工", "due_date": "2026-06-20"},
            ], ensure_ascii=False),
            "summary": "本次启动会明确了项目定位、用地条件和设计要求，确定了南区高层品字形布局方案和售楼处位置。",
            "next_actions_json": json.dumps([
                {"action": "总图方案南区布局深化", "owner": "张工", "due": "2026-06-15"},
                {"action": "日照分析复核", "owner": "李工", "due": "2026-06-12"},
            ], ensure_ascii=False),
        },
        {
            "title": "总图方案中期评审",
            "date": now + timedelta(days=0, hours=3),
            "status": "scheduled",
            "agenda": "1. 总图方案进展汇报\n2. 日照分析结果\n3. 户型配比讨论\n4. 下阶段工作安排",
            "summary": "",
            "next_actions_json": "[]",
            "todos": "[]",
            "minutes": "",
        },
        {
            "title": "立面风格定案会",
            "date": now + timedelta(days=7),
            "status": "scheduled",
            "agenda": "1. 立面风格方案比选\n2. 材料意向确认\n3. 效果图要求",
            "summary": "",
            "next_actions_json": "[]",
            "todos": "[]",
            "minutes": "",
        },
        {
            "title": "户型优化讨论会",
            "date": now + timedelta(days=5),
            "status": "scheduled",
            "agenda": "1. 160㎡户型优化\n2. 225㎡户型平面调整\n3. 得房率复核",
            "summary": "",
            "next_actions_json": "[]",
            "todos": "[]",
            "minutes": "",
        },
        {
            "title": "示范区概念方案评审",
            "date": now - timedelta(days=2),
            "status": "completed",
            "agenda": "1. 示范区范围确认\n2. 动线设计\n3. 景观节点",
            "minutes": "示范区确定为A区入口至售楼处段，动线全长约200m，重点打造入口广场、中心水景和样板房庭院三个节点。",
            "summary": "确定了示范区范围和三个核心景观节点。",
            "next_actions_json": "[]",
            "todos": "[]",
        },
    ]
    for md in meetings_data:
        m = Meeting(project_id=hrb.id, **md)
        db.add(m)

    # Add one meeting to 太原 project
    taiyuan = projects["太原万科城市更新项目"]
    m_ty = Meeting(
        project_id=taiyuan.id,
        title="太原项目概念方案启动会",
        date=now + timedelta(days=2),
        status="scheduled",
        agenda="1. 用地条件分析\n2. 文保建筑梳理\n3. 容积率测算",
        summary="",
        next_actions_json="[]",
        todos="[]",
        minutes="",
    )
    db.add(m_ty)
    db.commit()


def _seed_tasks(db, projects: dict):
    """Create sample tasks linked to 哈尔滨项目."""
    hrb = projects["哈尔滨群力西三地块住宅项目"]
    now = datetime.now()
    tasks_data = [
        {"title": "总图方案深化", "status": "in_progress", "priority": "high", "assignee_type": "human", "source": "meeting", "due_date": now + timedelta(days=6), "description": "南区高层品字形布局深化，完成总图定稿"},
        {"title": "日照分析复核", "status": "in_progress", "priority": "high", "assignee_type": "human", "source": "meeting", "due_date": now + timedelta(days=3), "description": "大寒日日照分析复核，确保满足3h标准"},
        {"title": "售楼处概念方案", "status": "todo", "priority": "medium", "assignee_type": "human", "source": "meeting", "due_date": now + timedelta(days=11), "description": "售楼处建筑概念方案设计"},
        {"title": "立面风格意向收集", "status": "todo", "priority": "medium", "assignee_type": "ai", "source": "ai", "due_date": now + timedelta(days=8), "description": "收集寒地住宅立面参考案例"},
        {"title": "竞品项目资料整理", "status": "done", "priority": "low", "assignee_type": "ai", "source": "ai", "due_date": now - timedelta(days=2), "description": "整理哈尔滨同板块竞品项目资料"},
        {"title": "技术指标复核", "status": "todo", "priority": "high", "assignee_type": "ai", "source": "manual", "due_date": now + timedelta(days=2), "description": "复核容积率、建筑密度、绿地率等规划指标"},
        {"title": "户型平面优化（160㎡）", "status": "todo", "priority": "medium", "assignee_type": "human", "source": "meeting", "due_date": now + timedelta(days=14), "description": "160㎡户型平面优化，提升得房率"},
        {"title": "景观概念方案", "status": "todo", "priority": "medium", "assignee_type": "human", "source": "manual", "due_date": now + timedelta(days=21), "description": "示范区景观概念方案设计"},
        {"title": "消防专篇编制", "status": "todo", "priority": "high", "assignee_type": "ai", "source": "ai", "due_date": now + timedelta(days=5), "description": "高层住宅消防设计专篇"},
        {"title": "报批流程梳理", "status": "done", "priority": "low", "assignee_type": "ai", "source": "manual", "due_date": now - timedelta(days=5), "description": "梳理规划报批流程和时间节点"},
    ]
    for td in tasks_data:
        t = Task(project_id=hrb.id, **td)
        db.add(t)

    # Add tasks to other projects
    taiyuan = projects["太原万科城市更新项目"]
    ty_tasks = [
        {"title": "文保建筑测绘", "status": "todo", "priority": "high", "assignee_type": "human", "source": "manual", "due_date": now + timedelta(days=10), "description": "对用地内文保建筑进行现状测绘"},
        {"title": "容积率测算", "status": "in_progress", "priority": "high", "assignee_type": "human", "source": "meeting", "due_date": now + timedelta(days=7), "description": "多方案容积率测算与比选"},
    ]
    for td in ty_tasks:
        t = Task(project_id=taiyuan.id, **td)
        db.add(t)

    taizhou = projects["台州凤起云城4号地块"]
    tz_tasks = [
        {"title": "原桩基复核", "status": "in_progress", "priority": "high", "assignee_type": "human", "source": "manual", "due_date": now + timedelta(days=4), "description": "原桩基利用论证复核"},
        {"title": "新旧规范对比分析", "status": "todo", "priority": "medium", "assignee_type": "ai", "source": "ai", "due_date": now + timedelta(days=7), "description": "新旧规范过渡期条款对比"},
    ]
    for td in tz_tasks:
        t = Task(project_id=taizhou.id, **td)
        db.add(t)

    db.commit()


def _seed_project_tasks(db, projects: dict):
    """Create ProjectTask entries (used by the boss dashboard risk_tasks)."""
    hrb = projects["哈尔滨群力西三地块住宅项目"]
    project_tasks_data = [
        {"task_name": "总图方案深化", "task_type": "design", "priority": "high", "owner_role": "张工", "estimated_days": 7, "risk_level": "high", "status": "in_progress", "output_requirement": "完成总图定稿"},
        {"task_name": "日照分析复核", "task_type": "analysis", "priority": "high", "owner_role": "李工", "estimated_days": 3, "risk_level": "high", "status": "in_progress", "output_requirement": "日照分析报告"},
        {"task_name": "售楼处概念方案", "task_type": "design", "priority": "medium", "owner_role": "王工", "estimated_days": 11, "risk_level": "medium", "status": "todo", "output_requirement": "概念方案文本"},
        {"task_name": "立面风格确定", "task_type": "design", "priority": "high", "owner_role": "张工", "estimated_days": 10, "risk_level": "medium", "status": "todo", "output_requirement": "立面风格意向板"},
        {"task_name": "户型优化（160㎡）", "task_type": "design", "priority": "medium", "owner_role": "张工", "estimated_days": 14, "risk_level": "低", "status": "todo", "output_requirement": "户型平面图"},
        {"task_name": "景观概念方案", "task_type": "design", "priority": "medium", "owner_role": "王工", "estimated_days": 21, "risk_level": "低", "status": "todo", "output_requirement": "景观概念文本"},
        {"task_name": "技术指标复核", "task_type": "analysis", "priority": "high", "owner_role": "AI规范检索员", "estimated_days": 2, "risk_level": "medium", "status": "todo", "output_requirement": "指标复核报告"},
        {"task_name": "竞品资料收集整理", "task_type": "research", "priority": "low", "owner_role": "AI资料分析师", "estimated_days": 5, "risk_level": "低", "status": "done", "output_requirement": "竞品分析报告"},
        {"task_name": "消防专篇编制", "task_type": "analysis", "priority": "high", "owner_role": "AI规范检索员", "estimated_days": 5, "risk_level": "medium", "status": "todo", "output_requirement": "消防设计专篇"},
        {"task_name": "报批流程梳理", "task_type": "research", "priority": "low", "owner_role": "AI资料分析师", "estimated_days": 3, "risk_level": "低", "status": "done", "output_requirement": "报批流程清单"},
    ]
    for ptd in project_tasks_data:
        pt = ProjectTask(project_id=hrb.id, **ptd)
        db.add(pt)
    db.commit()


def _seed_skill_cards(db, projects: dict):
    """Create sample skill cards linked to 哈尔滨项目."""
    hrb = projects["哈尔滨群力西三地块住宅项目"]
    now = datetime.now()

    cards_data = [
        {
            "card_type": "tech_points",
            "title": "群力西项目技术重点分析",
            "status": "completed",
            "input_json": json.dumps({"project_name": hrb.name}, ensure_ascii=False),
            "output_data": json.dumps(MOCK_TECH_POINTS, ensure_ascii=False),
            "output_json": json.dumps(MOCK_TECH_POINTS, ensure_ascii=False),
            "markdown": "## 技术重点分析\n\n" + "\n\n".join(
                f"### {tp['dimension']}\n- **风险等级**: {tp['risk']}\n- {tp['content']}"
                for tp in MOCK_TECH_POINTS
            ),
            "source": "ai",
            "created_by": "ai",
            "completed_at": now - timedelta(days=5),
        },
        {
            "card_type": "task_breakdown",
            "title": "方案阶段任务拆解",
            "status": "completed",
            "input_json": json.dumps({"project_name": hrb.name, "phase": "方案"}, ensure_ascii=False),
            "output_data": json.dumps(MOCK_TASK_BREAKDOWN, ensure_ascii=False),
            "output_json": json.dumps(MOCK_TASK_BREAKDOWN, ensure_ascii=False),
            "markdown": "## 方案阶段任务拆解\n\n" + "\n\n".join(
                f"- **{tb['title']}** (优先级: {tb['priority']}, 负责人类型: {tb['assignee_type']}, 预计 {tb['due_days']} 天)"
                for tb in MOCK_TASK_BREAKDOWN
            ),
            "source": "ai",
            "created_by": "ai",
            "completed_at": now - timedelta(days=5),
        },
        {
            "card_type": "meeting_minutes",
            "title": "方案启动会纪要",
            "status": "completed",
            "input_json": json.dumps({"meeting_title": "群力西项目方案启动会"}, ensure_ascii=False),
            "output_data": json.dumps(MOCK_MEETING_MINUTES, ensure_ascii=False),
            "output_json": json.dumps(MOCK_MEETING_MINUTES, ensure_ascii=False),
            "markdown": "## 方案启动会纪要\n\n" + MOCK_MEETING_MINUTES["summary"] + "\n\n### 关键决议\n" + "\n".join(f"- {d}" for d in MOCK_MEETING_MINUTES["key_decisions"]),
            "source": "ai",
            "created_by": "ai",
            "completed_at": now - timedelta(days=7),
        },
        {
            "card_type": "agenda",
            "title": "总图方案评审会议程",
            "status": "completed",
            "input_json": json.dumps({"meeting_title": "总图方案中期评审"}, ensure_ascii=False),
            "output_data": json.dumps(MOCK_MEETING_AGENDA, ensure_ascii=False),
            "output_json": json.dumps(MOCK_MEETING_AGENDA, ensure_ascii=False),
            "markdown": "## 总图方案评审会议程\n\n" + "\n\n".join(
                f"{item['order']}. **{item['topic']}** ({item['duration_min']}min, {item['presenter']})"
                for item in MOCK_MEETING_AGENDA["items"]
            ),
            "source": "ai",
            "created_by": "ai",
            "completed_at": now - timedelta(days=1),
        },
        {
            "card_type": "ppt_structure",
            "title": "方案汇报PPT架构",
            "status": "completed",
            "input_json": json.dumps({"project_name": hrb.name}, ensure_ascii=False),
            "output_data": json.dumps(MOCK_PPT_STRUCTURE, ensure_ascii=False),
            "output_json": json.dumps(MOCK_PPT_STRUCTURE, ensure_ascii=False),
            "markdown": "## 方案汇报PPT架构\n\n" + "\n\n".join(
                f"**第{sec['page']}页: {sec['title']}**\n{sec['content']}"
                for sec in MOCK_PPT_STRUCTURE["sections"]
            ),
            "source": "ai",
            "created_by": "ai",
            "completed_at": now - timedelta(days=3),
        },
        {
            "card_type": "tech_points",
            "title": "日照分析专题",
            "status": "completed",
            "input_json": json.dumps({"project_name": hrb.name, "focus": "日照分析"}, ensure_ascii=False),
            "output_data": json.dumps([
                {"dimension": "大寒日日照", "level": "high", "content": "哈尔滨严寒地区，大寒日日照需满足>=3h，南向栋间距需严格控制", "risk": "高"},
                {"dimension": "冬至日日照", "level": "medium", "content": "冬至日日照可作为辅助参考，重点校核首层住户", "risk": "中等"},
            ], ensure_ascii=False),
            "output_json": json.dumps([
                {"dimension": "大寒日日照", "level": "high", "content": "哈尔滨严寒地区，大寒日日照需满足>=3h", "risk": "高"},
            ], ensure_ascii=False),
            "markdown": "## 日照分析专题\n\n- 大寒日日照需满足>=3h\n- 南向栋间距需严格控制",
            "source": "ai",
            "created_by": "ai",
            "completed_at": now - timedelta(days=2),
        },
    ]

    for cd in cards_data:
        sc = SkillCard(project_id=hrb.id, **cd)
        db.add(sc)

    # Add one skill card to 太原 project
    taiyuan = projects["太原万科城市更新项目"]
    sc_ty = SkillCard(
        project_id=taiyuan.id,
        card_type="tech_points",
        title="太原项目技术重点分析",
        status="completed",
        input_json=json.dumps({"project_name": taiyuan.name}, ensure_ascii=False),
        output_data=json.dumps([
            {"dimension": "文保建筑", "level": "high", "content": "用地内存在两处文保建筑，需协调保护范围", "risk": "高"},
            {"dimension": "退界要求", "level": "medium", "content": "退道路红线>=10m，退文保建筑保护范围>=5m", "risk": "中等"},
        ], ensure_ascii=False),
        output_json=json.dumps([], ensure_ascii=False),
        markdown="## 太原项目技术重点\n\n- 文保建筑保护范围协调\n- 退界要求确认",
        source="ai",
        created_by="ai",
        completed_at=now - timedelta(days=1),
    )
    db.add(sc_ty)
    db.commit()


def _seed_team_assignments(db, projects: dict):
    """Create team assignments for 哈尔滨项目."""
    hrb = projects["哈尔滨群力西三地块住宅项目"]
    assignments_data = [
        {"member_name": "张工", "member_type": "human", "role": "方案主创", "responsibilities": "总图方案、高层布局、户型设计"},
        {"member_name": "李工", "member_type": "human", "role": "技术负责", "responsibilities": "日照分析、规范复核、技术指标"},
        {"member_name": "王工", "member_type": "human", "role": "景观设计", "responsibilities": "示范区设计、景观概念、植物配置"},
        {"member_name": "资料分析师", "member_type": "ai", "role": "资料分析", "responsibilities": "项目资料解析、技术要点提取、竞品分析"},
        {"member_name": "会议秘书", "member_type": "ai", "role": "会议管理", "responsibilities": "会议纪要生成、待办提取、议程建议"},
        {"member_name": "PPT架构师", "member_type": "ai", "role": "文档架构", "responsibilities": "汇报结构设计、页面建议、内容组织"},
    ]
    for ad in assignments_data:
        ta = TeamAssignment(project_id=hrb.id, **ad)
        db.add(ta)
    db.commit()


def _seed_team_members(db):
    """Create team members with workload data."""
    members_data = [
        {"name": "张工", "role": "方案主创", "skills": json.dumps(["总图设计", "户型优化", "立面设计"], ensure_ascii=False), "status": "busy", "workload": 75},
        {"name": "李工", "role": "技术负责", "skills": json.dumps(["日照分析", "规范复核", "技术指标"], ensure_ascii=False), "status": "busy", "workload": 60},
        {"name": "王工", "role": "景观设计", "skills": json.dumps(["景观概念", "植物配置", "示范区设计"], ensure_ascii=False), "status": "available", "workload": 30},
        {"name": "赵工", "role": "结构设计", "skills": json.dumps(["结构选型", "桩基设计", "抗震计算"], ensure_ascii=False), "status": "available", "workload": 20},
    ]
    # Clear existing team members first
    db.query(TeamMember).delete()
    for md in members_data:
        m = TeamMember(**md)
        db.add(m)
    db.commit()


def _update_digital_employees_workload(db):
    """Update DigitalEmployee workload to reflect realistic data."""
    employees = db.query(DigitalEmployee).all()
    workload_map = {
        "AI项目经理": 45,
        "AI总图助理": 60,
        "AI立面助理": 35,
        "AI汇报助理": 25,
        "AI资料管理员": 50,
    }
    for emp in employees:
        if emp.name in workload_map:
            emp.workload = workload_map[emp.name]
        else:
            emp.workload = 20
    db.commit()


def main():
    print("=" * 60)
    print("ROM-AI Demo 1.0 — 示例数据初始化")
    print("=" * 60)

    # Initialize DB schema
    init_db()

    db = SessionLocal()
    try:
        print("\n[1/7] 清空旧数据...")
        _clear_all(db)
        print("  ✓ 已清空")

        print("[2/7] 创建示例项目...")
        projects = _seed_projects(db)
        for name, p in projects.items():
            print(f"  ✓ {name} (ID: {p.id[:8]}...)")

        print("[3/7] 创建示例会议...")
        _seed_meetings(db, projects)
        print("  ✓ 已创建6场会议")

        print("[4/7] 创建示例任务...")
        _seed_tasks(db, projects)
        print("  ✓ 已创建任务")

        print("[5/7] 创建技能卡片...")
        _seed_skill_cards(db, projects)
        print("  ✓ 已创建技能卡片")

        print("[6/7] 创建项目任务(ProjectTask)...")
        _seed_project_tasks(db, projects)
        print("  ✓ 已创建项目任务")

        print("[7/7] 创建团队分工...")
        _seed_team_assignments(db, projects)
        _seed_team_members(db)
        _update_digital_employees_workload(db)
        print("  ✓ 已创建团队分工与成员")

        # Summary
        print("\n" + "=" * 60)
        print("数据初始化完成！统计：")
        print(f"  项目：{db.query(Project).count()} 个")
        print(f"  会议：{db.query(Meeting).count()} 场")
        print(f"  任务(Task)：{db.query(Task).count()} 项")
        print(f"  项目任务(ProjectTask)：{db.query(ProjectTask).count()} 项")
        print(f"  技能卡片：{db.query(SkillCard).count()} 张")
        print(f"  团队分工：{db.query(TeamAssignment).count()} 人")
        print(f"  团队成员：{db.query(TeamMember).count()} 人")
        print(f"  数字员工：{db.query(DigitalEmployee).count()} 人")
        print("=" * 60)

    except Exception as e:
        print(f"\n✗ 错误：{e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()