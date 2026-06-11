import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Bot, Brain, Briefcase, Plus, ScanSearch, Settings, Users } from 'lucide-react';
import { getDashboard, type DashboardData } from '../lib/projectsApi';

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getDashboard().then(setData).catch((error) => setMessage(`Dashboard 加载失败：${String(error)}`));
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8">
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">RMO Operating System</span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">项目智能工作台</h1>
          <p className="max-w-3xl text-sm leading-7 text-zinc-400">
            首页现在是项目运行 Dashboard，而不是宣传页。所有入口围绕 Project、知识库、AI代理和数字员工展开。
          </p>
        </div>

        {message && <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{message}</div>}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <Briefcase className="mb-4 text-amber-300" size={24} />
            <div className="text-3xl font-semibold text-white">{data?.project_count ?? 0}</div>
            <div className="text-sm text-zinc-500">项目总数</div>
          </div>
          <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <Brain className="mb-4 text-emerald-300" size={24} />
            <div className="text-3xl font-semibold text-white">{Number(data?.knowledge?.total_files ?? 0)}</div>
            <div className="text-sm text-zinc-500">知识库文件</div>
          </div>
          <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <Bot className="mb-4 text-blue-300" size={24} />
            <div className="text-3xl font-semibold text-white">{data?.recent_agent_runs.length ?? 0}</div>
            <div className="text-sm text-zinc-500">最近代理运行</div>
          </div>
          <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <Users className="mb-4 text-purple-300" size={24} />
            <div className="text-3xl font-semibold text-white">{data?.digital_employees.length ?? 0}</div>
            <div className="text-sm text-zinc-500">数字员工</div>
          </div>
        </div>

        {data?.mock_mode && (
          <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            当前后端处于 Mock 模式：DeepSeek 未配置时系统仍可运行，但分析和问答会明确标注 Mock。
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-5">
          {[
            { to: '/projects/new', label: '新建项目', icon: Plus },
            { to: '/projects', label: '上传资料', icon: Briefcase },
            { to: '/knowledge', label: '扫描知识库', icon: ScanSearch },
            { to: '/agents', label: '运行项目解析代理', icon: Bot },
            { to: '/designers', label: '生成团队配置', icon: Users },
          ].map((item) => (
            <Link key={item.label} to={item.to} className="rounded-lg border border-[#333333] bg-[#111111] p-4 text-sm text-zinc-300 hover:border-amber-400/40">
              <item.icon size={18} className="mb-3 text-amber-300" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <section className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">最近项目</h2>
            <div className="space-y-3">
              {data?.recent_projects.length ? data.recent_projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="block rounded-lg bg-[#171717] p-3 text-sm text-zinc-300 hover:bg-[#202020]">
                  {project.name}
                  <div className="mt-1 text-xs text-zinc-500">{project.city || '城市待补充'} · {project.phase || '阶段待补充'}</div>
                </Link>
              )) : <p className="text-sm text-zinc-500">暂无项目。</p>}
            </div>
          </section>
          <section className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <h2 className="mb-4 text-sm font-semibold text-white">最近报告</h2>
            <div className="space-y-3 text-sm text-zinc-400">
              {data?.recent_reports.length ? data.recent_reports.map((report) => (
                <div key={report.id} className="rounded-lg bg-[#171717] p-3">
                  {report.report_type} · <span className="text-amber-300">{report.mode}</span>
                </div>
              )) : <p className="text-zinc-500">暂无报告。</p>}
            </div>
          </section>
          <section className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">系统设置</h2>
              <Link to="/settings" className="text-xs text-zinc-500 hover:text-white"><Settings size={16} /></Link>
            </div>
            <div className="space-y-3 text-sm text-zinc-400">
              <div>Mock 模式：{data?.mock_mode ? '开启' : '关闭'}</div>
              <div>知识库文件：{Number(data?.knowledge?.total_files ?? 0)}</div>
              <div>双链数量：{Number(data?.knowledge?.link_count ?? 0)}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
