import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, BarChart3, Bot, Briefcase, CalendarDays, Users } from 'lucide-react';
import { getBossDashboard, type BossDashboardData } from '../lib/projectsApi';

export function BossPage() {
  const [data, setData] = useState<BossDashboardData | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getBossDashboard().then(setData).catch((error) => setMessage(`老板驾驶舱加载失败：${String(error)}`));
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8">
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">Management Cockpit</span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">管理驾驶舱</h1>
          <p className="max-w-3xl text-sm leading-7 text-zinc-400">
            隐藏权限页面：只读汇总公司项目态势、风险任务、会议待办、人员负载、AI成果和知识沉淀。
          </p>
        </div>

        {message && <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{message}</div>}

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-6">
          <Stat label="项目总数" value={data?.project_count ?? 0} icon={Briefcase} />
          <Stat label="进行中" value={data?.active_project_count ?? 0} icon={BarChart3} />
          <Stat label="开放任务" value={data?.open_task_count ?? 0} icon={AlertTriangle} />
          <Stat label="会议" value={data?.meeting_count ?? 0} icon={CalendarDays} />
          <Stat label="AI成果" value={data?.skill_card_count ?? 0} icon={Bot} />
          <Stat label="知识文件" value={Number(data?.knowledge?.total_files ?? 0)} icon={Users} />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Panel title="阶段分布">
            <div className="space-y-3">
              {Object.entries(data?.phase_counts ?? {}).map(([phase, count]) => (
                <div key={phase} className="flex items-center justify-between rounded-lg bg-[#171717] p-3 text-sm">
                  <span className="text-zinc-300">{phase}</span>
                  <span className="text-amber-300">{count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="风险任务">
            <div className="space-y-3">
              {data?.risk_tasks.length ? data.risk_tasks.slice(0, 8).map((task) => (
                <div key={task.id} className="rounded-lg bg-[#171717] p-3 text-sm">
                  <div className="mb-1 text-white">{task.task_name}</div>
                  <div className="text-xs text-zinc-500">{task.owner_role || '待分配'} · {task.risk_level} · {task.status}</div>
                </div>
              )) : <p className="text-sm text-zinc-500">暂无风险任务。</p>}
            </div>
          </Panel>

          <Panel title="会议与决策">
            <div className="space-y-3">
              {data?.recent_meetings.length ? data.recent_meetings.map((meeting) => (
                <div key={meeting.id} className="rounded-lg bg-[#171717] p-3 text-sm">
                  <div className="mb-1 text-white">{meeting.title}</div>
                  <div className="text-xs text-zinc-500">{meeting.status} · 待办 {meeting.next_actions?.length ?? 0}</div>
                </div>
              )) : <p className="text-sm text-zinc-500">暂无会议。</p>}
            </div>
          </Panel>

          <Panel title="人员负载">
            <div className="space-y-3">
              {data?.member_load.slice(0, 10).map((member) => (
                <div key={`${member.type}-${member.id}`} className="rounded-lg bg-[#171717] p-3">
                  <div className="mb-2 flex items-center justify-between text-sm"><span className="text-white">{member.name}</span><span className="text-zinc-500">{member.workload}%</span></div>
                  <div className="h-2 rounded-full bg-[#0A0A0A]"><div className="h-2 rounded-full bg-amber-400" style={{ width: `${Math.min(member.workload, 100)}%` }} /></div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="AI成果分布">
            <div className="space-y-3">
              {Object.entries(data?.ai_card_distribution ?? {}).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between rounded-lg bg-[#171717] p-3 text-sm">
                  <span className="text-zinc-300">{type}</span>
                  <span className="text-emerald-300">{count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="知识沉淀">
            <div className="space-y-3 text-sm text-zinc-400">
              <div className="rounded-lg bg-[#171717] p-3">Markdown：{Number(data?.knowledge?.markdown_files ?? 0)}</div>
              <div className="rounded-lg bg-[#171717] p-3">PDF/Word/Excel：{Number(data?.knowledge?.pdf_docx_xlsx_files ?? 0)}</div>
              <div className="rounded-lg bg-[#171717] p-3">双链：{Number(data?.knowledge?.link_count ?? 0)}</div>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Briefcase }) {
  return (
    <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
      <Icon className="mb-4 text-amber-300" size={22} />
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-lg border border-[#333333] bg-[#111111] p-5"><h2 className="mb-4 text-sm font-semibold text-white">{title}</h2>{children}</section>;
}
