import { useEffect, useRef, useState } from 'react';
import {
  ListTodo, AlertTriangle, FileText, Monitor, BarChart3, PenTool,
  Image, Sparkles, Brain, CheckCircle, Send, Loader2, Bot, X, ClipboardCopy,
} from 'lucide-react';
import {
  listProjects,
  runSkillCard,
  type ProjectSummary,
  type SkillCard,
} from '../lib/projectsApi';

/* ---------- Skill card definitions ---------- */
const activeSkills = [
  { type: 'task_breakdown', title: '任务拆解卡', Icon: ListTodo, color: 'blue', desc: '把项目描述转成任务、责任角色和交付要求' },
  { type: 'technical_focus', title: '技术重点卡', Icon: AlertTriangle, color: 'amber', desc: '提取日照、退界、面积、消防等复用重点' },
  { type: 'meeting_minutes', title: '会议纪要卡', Icon: FileText, color: 'green', desc: '把会议记录转成纪要、脑图和待办' },
  { type: 'ppt_structure', title: 'PPT结构卡', Icon: Monitor, color: 'purple', desc: '生成业主汇报或内部评审的PPT框架' },
] as const;

const upcomingSkills = [
  { title: '竞品分析', Icon: BarChart3 },
  { title: '概念文字稿', Icon: PenTool },
  { title: '参考图分类', Icon: Image },
  { title: '生图提示词', Icon: Sparkles },
  { title: 'AI生图', Icon: Brain },
  { title: '方案评审', Icon: CheckCircle },
];

function colorClasses(color: string) {
  const map: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    blue:   { bg: 'bg-blue-400/10',    border: 'border-blue-400/30',    text: 'text-blue-300',    icon: 'text-blue-400' },
    amber:  { bg: 'bg-amber-400/10',   border: 'border-amber-400/30',   text: 'text-amber-300',   icon: 'text-amber-400' },
    green:  { bg: 'bg-emerald-400/10',  border: 'border-emerald-400/30', text: 'text-emerald-300', icon: 'text-emerald-400' },
    purple: { bg: 'bg-purple-400/10',   border: 'border-purple-400/30', text: 'text-purple-300',  icon: 'text-purple-400' },
  };
  return map[color] ?? map.amber;
}

/* ---------- Intent detection ---------- */
function detectIntent(text: string): string | null {
  if (/任务|拆解|分工|排期/.test(text)) return 'task_breakdown';
  if (/技术|重点|日照|退界|消防|规范/.test(text)) return 'technical_focus';
  if (/会议|纪要|待办|记录/.test(text)) return 'meeting_minutes';
  if (/PPT|汇报|演示/.test(text)) return 'ppt_structure';
  return null;
}

/* ---------- Types ---------- */
type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  card?: SkillCard | null;
  isExecuting?: boolean;
};

/* ---------- Component ---------- */
export function AgentsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectId, setProjectId] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialogSkill, setDialogSkill] = useState<string | null>(null);
  const [dialogInput, setDialogInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listProjects()
      .then((items) => {
        setProjects(items);
        setProjectId(items[0]?.id ?? '');
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  /* ---- helpers ---- */
  function addMsg(msg: ChatMsg) {
    setMessages((prev) => [...prev, msg]);
  }

  function updateMsg(id: string, patch: Partial<ChatMsg>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  /* ---- chat send ---- */
  async function send() {
    if (!input.trim() || busy) return;
    addMsg({ id: crypto.randomUUID(), role: 'user', content: input });
    const text = input;
    setInput('');
    setBusy(true);

    const intent = detectIntent(text);
    if (intent && projectId) {
      const skill = activeSkills.find((s) => s.type === intent);
      const execId = crypto.randomUUID();
      addMsg({ id: execId, role: 'assistant', content: `正在执行 ${skill?.title ?? intent}...`, isExecuting: true });
      try {
        const result = await runSkillCard(projectId, intent, text);
        updateMsg(execId, {
          content: `${skill?.title ?? intent} 执行完成`,
          card: result,
          isExecuting: false,
        });
      } catch (error) {
        updateMsg(execId, { content: `执行失败：${String(error)}`, isExecuting: false });
      }
    } else if (!projectId) {
      addMsg({ id: crypto.randomUUID(), role: 'assistant', content: '请先选择一个项目。' });
    } else {
      addMsg({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '我理解您的需求。请在描述中包含关键词（任务、技术重点、会议纪要、PPT），或直接点击右侧技能卡片执行。',
      });
    }
    setBusy(false);
  }

  /* ---- direct card execution ---- */
  async function executeFromDialog() {
    if (!dialogSkill || !projectId || busy) return;
    setBusy(true);
    const skill = activeSkills.find((s) => s.type === dialogSkill);
    const execId = crypto.randomUUID();
    addMsg({ id: execId, role: 'assistant', content: `正在执行 ${skill?.title ?? dialogSkill}...`, isExecuting: true });
    try {
      const result = await runSkillCard(projectId, dialogSkill, dialogInput);
      updateMsg(execId, { content: `${skill?.title ?? dialogSkill} 执行完成`, card: result, isExecuting: false });
    } catch (error) {
      updateMsg(execId, { content: `执行失败：${String(error)}`, isExecuting: false });
    }
    setBusy(false);
    setDialogSkill(null);
    setDialogInput('');
  }

  /* ---- render ---- */
  return (
    <main className="min-h-screen bg-gray-900 px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-[1360px]">
        {/* Header */}
        <div className="mb-8">
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            Design Agent Console
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">AI设计代理</h1>
          <p className="max-w-3xl text-sm leading-7 text-zinc-400">
            输入需求，系统自动识别意图并执行技能卡片，成果回写到项目作战室。
          </p>
        </div>

        {/* Project selector */}
        <div className="mb-5 flex items-center gap-3">
          <span className="text-sm text-zinc-400">当前项目：</span>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="rounded-xl border border-white/10 bg-gray-800 px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-amber-400/60"
          >
            {!projectId && <option value="">请选择项目</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Main: chat + cards */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[3fr_2fr]">
          {/* Left — chat (60%) */}
          <div className="flex min-h-[600px] flex-col rounded-xl border border-white/10 bg-white/5">
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {!messages.length && (
                <div className="flex h-full min-h-[420px] items-center justify-center text-center">
                  <div>
                    <Bot size={40} className="mx-auto mb-4 text-zinc-600" />
                    <p className="text-sm text-zinc-500">描述您的需求，AI 将自动识别意图</p>
                    <p className="mt-2 text-xs text-zinc-600">
                      关键词：任务拆解 · 技术重点 · 会议纪要 · PPT结构
                    </p>
                  </div>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-amber-400 text-black'
                        : 'border border-white/10 bg-gray-800 text-zinc-300'
                    }`}
                  >
                    {msg.isExecuting ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                        {msg.content}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm leading-7">{msg.content}</p>
                        {msg.card && (
                          <div className="mt-3 rounded-xl border border-white/10 bg-gray-900 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-sm font-semibold text-amber-300">{msg.card.title}</span>
                              <button
                                onClick={() => navigator.clipboard.writeText(msg.card?.markdown ?? '')}
                                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                              >
                                <ClipboardCopy size={12} />
                                复制
                              </button>
                            </div>
                            <pre className="max-h-[280px] overflow-y-auto whitespace-pre-wrap text-xs leading-6 text-zinc-400">
                              {msg.card.markdown || JSON.stringify(msg.card.output_json, null, 2)}
                            </pre>
                            <button className="mt-3 rounded-lg bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-400/20">
                              回写到项目
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="输入需求，如：帮我拆解任务..."
                  className="flex-1 rounded-xl border border-white/10 bg-gray-800 px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500 focus:border-amber-400/60"
                />
                <button
                  disabled={busy || !input.trim()}
                  onClick={send}
                  className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-300 disabled:opacity-50"
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Right — skill cards (40%) */}
          <div className="space-y-5">
            {/* Active skills */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-sm font-semibold text-white">技能卡片</h2>
              <div className="grid grid-cols-2 gap-3">
                {activeSkills.map((skill) => {
                  const c = colorClasses(skill.color);
                  const SkillIcon = skill.Icon;
                  return (
                    <button
                      key={skill.type}
                      onClick={() => { setDialogSkill(skill.type); setDialogInput(''); }}
                      className={`rounded-xl border ${c.border} ${c.bg} p-4 text-left transition-all hover:scale-[1.02] hover:brightness-125`}
                    >
                      <SkillIcon size={24} className={`mb-2 ${c.icon}`} />
                      <div className={`text-sm font-semibold ${c.text}`}>{skill.title}</div>
                      <p className="mt-1 text-xs text-zinc-500">{skill.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming skills */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <h2 className="mb-4 text-sm font-semibold text-zinc-500">即将上线</h2>
              <div className="grid grid-cols-2 gap-3">
                {upcomingSkills.map((skill) => {
                  const UpIcon = skill.Icon;
                  return (
                    <div
                      key={skill.title}
                      className="relative rounded-xl border border-white/5 bg-white/[0.02] p-4 opacity-40"
                    >
                      <span className="absolute right-2 top-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-500">
                        即将上线
                      </span>
                      <UpIcon size={20} className="mb-2 text-zinc-600" />
                      <div className="text-sm font-semibold text-zinc-500">{skill.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execute dialog */}
      {dialogSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                执行 {activeSkills.find((s) => s.type === dialogSkill)?.title}
              </h2>
              <button onClick={() => setDialogSkill(null)} className="text-zinc-400 transition-colors hover:text-white">
                <X size={20} />
              </button>
            </div>
            <textarea
              value={dialogInput}
              onChange={(e) => setDialogInput(e.target.value)}
              placeholder="补充执行参数（可选）..."
              className="mb-4 min-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
            />
            <button
              disabled={busy}
              onClick={executeFromDialog}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-amber-300 disabled:opacity-50"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              执行
            </button>
          </div>
        </div>
      )}
    </main>
  );
}