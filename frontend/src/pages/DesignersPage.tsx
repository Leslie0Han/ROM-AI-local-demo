import { useEffect, useState } from 'react';
import { Bot, UserRound, Users } from 'lucide-react';
import { getDashboard, listDigitalEmployees, listTeamMembers, type DashboardData, type DigitalEmployee, type NetworkMember } from '../lib/projectsApi';

function parseSkills(value: string) {
  try {
    return JSON.parse(value || '[]') as string[];
  } catch {
    return [];
  }
}

export function DesignersPage() {
  const [employees, setEmployees] = useState<DigitalEmployee[]>([]);
  const [members, setMembers] = useState<NetworkMember[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    listDigitalEmployees().then(setEmployees).catch(() => setEmployees([]));
    listTeamMembers().then((result) => setMembers(result.members.filter((member) => member.type === 'human'))).catch(() => setMembers([]));
    getDashboard().then(setDashboard).catch(() => setDashboard(null));
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8">
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">Human + AI Network</span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">数字网络平台</h1>
          <p className="max-w-3xl text-sm leading-7 text-zinc-400">
            1.0 先作为人机组织表：真实成员负责沟通、判断和审核，AI数字员工负责资料整理、任务拆解、PPT结构和风险检查。
          </p>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Stat label="真实成员" value={members.length} icon={UserRound} />
          <Stat label="AI数字员工" value={employees.length} icon={Bot} />
          <Stat label="项目数量" value={dashboard?.project_count ?? 0} icon={Users} />
          <Stat label="最近代理运行" value={dashboard?.recent_agent_runs.length ?? 0} icon={Bot} />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><UserRound size={17} className="text-amber-300" />真实成员</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {members.map((member) => (
                <PersonCard key={member.id} name={member.name} role={member.role} skills={parseSkills(member.skills)} status={member.status} workload={member.workload} accent="amber" />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white"><Bot size={17} className="text-blue-300" />AI数字员工</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {employees.map((employee) => (
                <PersonCard key={employee.id} name={employee.name} role={employee.role} skills={parseSkills(employee.skills)} status={employee.status} workload={employee.workload} accent="blue" avatar={employee.avatar} />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[#333333] bg-[#111111] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">协作规则 1.0</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            {['项目经理负责业主沟通和最终确认', 'AI负责生成第一版成果卡片', '真实成员负责深化和审核', '任务分配记录回写项目作战室'].map((item) => (
              <div key={item} className="rounded-lg bg-[#171717] p-4 text-sm leading-6 text-zinc-400">{item}</div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Users }) {
  return (
    <div className="rounded-lg border border-[#333333] bg-[#111111] p-5">
      <Icon className="mb-4 text-amber-300" size={22} />
      <div className="text-3xl font-semibold text-white">{value}</div>
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}

function PersonCard({ name, role, skills, status, workload, accent, avatar }: { name: string; role: string; skills: string[]; status: string; workload: number; accent: 'amber' | 'blue'; avatar?: string }) {
  return (
    <div className="rounded-lg border border-[#333333] bg-[#171717] p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent === 'amber' ? 'bg-amber-400/10 text-amber-300' : 'bg-blue-400/10 text-blue-300'}`}>
          {avatar || (accent === 'amber' ? <UserRound size={20} /> : <Bot size={20} />)}
        </div>
        <div>
          <h3 className="font-semibold text-white">{name}</h3>
          <p className="text-sm text-zinc-500">{role}</p>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {skills.map((skill) => <span key={skill} className="rounded-full border border-[#333333] px-2.5 py-1 text-xs text-zinc-400">{skill}</span>)}
      </div>
      <div className="flex items-center justify-between text-xs text-zinc-500"><span>{status}</span><span>负载 {workload}%</span></div>
    </div>
  );
}
