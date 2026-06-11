import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import models, schemas
from app.database import Base
from app.services import delete_project_library
from app.routes.projects import assign_project_task, create_project_task, update_project_task
from app.routes.team import (
    add_team_member,
    get_all_members,
    get_network_member_workload,
    update_global_team_member,
)


class ProjectDeleteTest(unittest.TestCase):
    def open_temp_db(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        return sessionmaker(autocommit=False, autoflush=False, bind=engine)()

    def test_delete_project_library_removes_project_records_and_managed_files(self):
        with TemporaryDirectory() as tmp:
            db = self.open_temp_db()
            try:
                project = models.Project(name="待删除项目", city="杭州")
                db.add(project)
                db.commit()
                db.refresh(project)

                project_dir = Path(tmp) / "projects" / project.id
                project_dir.mkdir(parents=True)
                project_file = project_dir / "资料.md"
                project_file.write_text("项目资料", encoding="utf-8")
                source_file = Path(tmp) / "source.md"
                source_file.write_text("原始文件", encoding="utf-8")

                db.add(models.ProjectFile(project_id=project.id, filename="资料.md", filepath=str(project_file), filetype="md", filesize=project_file.stat().st_size))
                db.add(models.ProjectTask(project_id=project.id, task_name="任务"))
                db.add(models.InboxItem(original_filename="资料.md", source_path=str(source_file), temp_path=str(source_file), project_id=project.id, status="已归档"))
                db.commit()

                result = delete_project_library(db, project.id, upload_root=Path(tmp))

                self.assertTrue(result["deleted"])
                self.assertEqual(result["deleted_project_id"], project.id)
                self.assertIsNone(db.get(models.Project, project.id))
                self.assertEqual(db.query(models.ProjectFile).filter_by(project_id=project.id).count(), 0)
                self.assertEqual(db.query(models.ProjectTask).filter_by(project_id=project.id).count(), 0)
                self.assertFalse(project_dir.exists())
                self.assertTrue(source_file.exists())
                inbox_item = db.query(models.InboxItem).first()
                self.assertEqual(inbox_item.project_id, "")
                self.assertEqual(inbox_item.status, "待确认")
            finally:
                db.close()


class ProjectTeamWorkflowTest(unittest.TestCase):
    def open_temp_db(self):
        engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(bind=engine)
        return sessionmaker(autocommit=False, autoflush=False, bind=engine)()

    def test_global_human_member_can_be_renamed_and_listed_with_ai_members(self):
        db = self.open_temp_db()
        try:
            member = models.TeamMember(name="张工", role="方案主创", skills='["总图"]')
            ai = models.DigitalEmployee(name="AI资料管理员", role="资料整理", skills='["资料"]', avatar="📎")
            db.add_all([member, ai])
            db.commit()
            db.refresh(member)

            updated = update_global_team_member(member.id, schemas.TeamMemberUpdate(name="张三", role="项目经理"), db)
            members = get_all_members(db)

            self.assertEqual(updated.name, "张三")
            self.assertTrue(any(item["id"] == member.id and item["type"] == "human" and item["name"] == "张三" for item in members["members"]))
            self.assertTrue(any(item["id"] == ai.id and item["type"] == "digital_employee" for item in members["members"]))
        finally:
            db.close()

    def test_project_team_accepts_network_member_and_assigns_project_task(self):
        db = self.open_temp_db()
        try:
            project = models.Project(name="杭州萧山湘北强排", city="杭州")
            member = models.TeamMember(name="李工", role="总图负责人", skills='["总图"]')
            db.add_all([project, member])
            db.commit()
            db.refresh(project)
            db.refresh(member)
            task = models.ProjectTask(project_id=project.id, task_name="复核总图指标", owner_role="总图负责人")
            db.add(task)
            db.commit()
            db.refresh(task)

            assignment = add_team_member(
                project.id,
                schemas.TeamAssignmentCreate(
                    member_id=member.id,
                    member_type="human",
                    member_name=member.name,
                    role="总图负责人",
                    responsibilities="复核总图指标",
                ),
                db,
            )
            assigned_task = assign_project_task(
                project.id,
                task.id,
                schemas.ProjectTaskAssigneeUpdate(
                    assignee_type="human",
                    assignee_id=member.id,
                    assignee_name=member.name,
                ),
                db,
            )
            workload = get_network_member_workload("human", member.id, db)

            self.assertEqual(assignment.member_id, member.id)
            self.assertEqual(assigned_task.assignee_id, member.id)
            self.assertEqual(assigned_task.assignee_name, "李工")
            self.assertEqual(assigned_task.owner_role, "李工")
            self.assertEqual(workload["task_count"], 1)
            self.assertEqual(workload["project_count"], 1)
            self.assertEqual(workload["tasks"][0]["task_name"], "复核总图指标")
        finally:
            db.close()

    def test_project_task_create_and_status_update_use_startup_task_table(self):
        db = self.open_temp_db()
        try:
            project = models.Project(name="任务项目", city="杭州")
            db.add(project)
            db.commit()
            db.refresh(project)

            task = create_project_task(
                project.id,
                schemas.ProjectTaskCreate(task_name="整理启动资料", priority="high", owner_role="项目经理"),
                db,
            )
            updated = update_project_task(project.id, task.id, schemas.ProjectTaskUpdate(status="doing"), db)

            self.assertEqual(task.project_id, project.id)
            self.assertEqual(task.task_name, "整理启动资料")
            self.assertEqual(updated.status, "doing")
            self.assertEqual(db.query(models.ProjectTask).filter_by(project_id=project.id).count(), 1)
            self.assertEqual(db.query(models.Task).filter_by(project_id=project.id).count(), 0)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
