import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ChevronDown,
  CloudOff,
  Database,
  FileSearch,
  FileText,
  FolderOpen,
  GitBranch,
  Link2,
  Lock,
  Monitor,
  RefreshCw,
  Search,
  Send,
  Server,
  Sparkles,
  Tags,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
const DEFAULT_VAULT = 'C:\\Users\\yz_ya\\Documents\\Obsidian Vault\\Obj-哈尔滨';
const PROJECT_PRESETS = [
  { name: 'Obj-哈尔滨', path: 'C:\\Users\\yz_ya\\Documents\\Obsidian Vault\\Obj-哈尔滨' },
  { name: 'Obj-市庄', path: 'C:\\Users\\yz_ya\\Documents\\Obsidian Vault\\Obj-市庄' },
];

type Source = {
  name: string;
  path: string;
  exists?: boolean;
  readable?: boolean;
};

type Agent = {
  id: string;
  name: string;
};

type IndexStatus = {
  backend?: string;
  total_chunks?: number;
  total_files?: number;
  index_path?: string;
  total_chunks_display?: string;
};

type ChatResponse = {
  reply: string;
  sources: string[];
};

const fallbackAgents: Agent[] = [
  { id: 'architecture', name: '建筑设计助手' },
  { id: 'code-review', name: '规范审查助手' },
  { id: 'drawing-review', name: '施工图校审助手' },
  { id: 'summary', name: '项目资料总结助手' },
  { id: 'obsidian', name: 'Obsidian 笔记问答助手' },
  { id: 'material', name: '材料做法助手' },
  { id: 'narrative', name: '汇报文案助手' },
];

const supportedTypes = ['.md', '.txt', '.pdf', '.docx', '.csv', '.xlsx', '.pptx'];
const supportedUploadExts = new Set(supportedTypes);
const maxBrowserFiles = 250;
const maxBrowserFileBytes = 25 * 1024 * 1024;
const maxBrowserTotalBytes = 90 * 1024 * 1024;

const obsidianFeatures = [
  { title: 'Markdown 笔记', desc: '读取 .md 文件，保留标题、段落与层级' },
  { title: '双链识别', desc: '识别 [[项目A]] 式双向引用关系' },
  { title: '标签系统', desc: '提取 #防火规范、#材料做法 等标签' },
  { title: '文件夹层级', desc: '保留目录结构，按项目组织知识' },
  { title: '引用关系图', desc: '为后续知识图谱和关联检索预留结构' },
  { title: '多维检索', desc: '按项目、标签、时间、关键词追问' },
];

const processingFlow = [
  '扫描本地文件夹',
  '解析文档内容',
  '提取标签与引用',
  '文本分块与索引',
  '检索相关上下文',
  '智能体生成回答',
  '显示引用来源',
];

const exampleQuestions = [
  '基于哈尔滨项目资料，当前最核心的设计重点是什么？',
  '哈尔滨项目中关于立面、幕墙或材料的资料有哪些？',
  '帮我整理哈尔滨项目的风险点，并标注引用来源。',
  '根据本地知识库，生成一份施工图审查清单。',
  '这个项目里有哪些会议纪要或复盘信息值得进入汇报？',
];

const privacyItems = [
  '文件默认从本地授权目录读取',
  '可选择是否调用云端模型',
  '敏感项目资料可切换本地模型路线',
  '支持本地 SQLite / 向量库部署',
  '回答显示引用来源，便于回查',
  '适合项目资料与企业内部知识沉淀',
];

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type UploadCandidate = {
  file: File;
  relativePath: string;
};

function fileExt(name: string) {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

function canUploadFile(file: File) {
  return supportedUploadExts.has(fileExt(file.name)) && file.size <= maxBrowserFileBytes;
}

function displayNameFromPath(path: string) {
  const clean = path.trim().replace(/[\\/]+$/, '');
  return clean.split(/[\\/]/).filter(Boolean).pop() || 'Local Source';
}

export const KnowledgeBaseFeature: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendLabel, setBackendLabel] = useState('未连接');
  const [folderPath, setFolderPath] = useState(DEFAULT_VAULT);
  const [sources, setSources] = useState<Source[]>([]);
  const [agents, setAgents] = useState<Agent[]>(fallbackAgents);
  const [selectedAgent, setSelectedAgent] = useState('architecture');
  const [indexStatus, setIndexStatus] = useState<IndexStatus>({});
  const [question, setQuestion] = useState('基于哈尔滨项目资料，帮我总结当前项目的核心设计重点、已出现的风险点，并列出可引用的资料来源。');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const activeAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgent) ?? agents[0],
    [agents, selectedAgent],
  );

  async function refreshAll() {
    try {
      const health = await apiGet<{ status: string; rag_backend: string; model: string }>('/health');
      setBackendOnline(true);
      setBackendLabel(`${health.rag_backend} · ${health.model}`);
    } catch {
      setBackendOnline(false);
      setBackendLabel('后端未启动');
      setMessage('请先启动 FastAPI 后端：uvicorn main:app --host 127.0.0.1 --port 8000 --reload');
      return;
    }

    try {
      const sourceData = await apiGet<{ sources: Source[] }>('/sources');
      setSources(sourceData.sources);
    } catch (error) {
      setMessage(`读取数据源失败：${String(error)}`);
    }

    try {
      const agentData = await apiGet<{ agents: Agent[] }>('/agents');
      setAgents(agentData.agents);
      if (!agentData.agents.some((agent) => agent.id === selectedAgent)) {
        setSelectedAgent(agentData.agents[0]?.id ?? 'architecture');
      }
    } catch {
      setAgents(fallbackAgents);
    }

    try {
      const status = await apiGet<IndexStatus>('/index/status');
      setIndexStatus(status);
    } catch (error) {
      setMessage(`读取索引状态失败：${String(error)}`);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  async function addSource() {
    setBusy(true);
    setMessage('正在添加知识库来源...');
    try {
      await apiPost('/sources/add', { path: folderPath, name: displayNameFromPath(folderPath) });
      await refreshAll();
      setMessage('知识库来源已授权，可以开始索引。');
    } catch (error) {
      setMessage(`添加失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function indexFolder() {
    setBusy(true);
    setMessage('正在索引本地资料，首次索引可能需要一些时间...');
    try {
      const result = await apiPost<{ indexed: number; directory: string }>('/index', { directory: folderPath });
      const status = await apiGet<IndexStatus>('/index/status');
      setIndexStatus(status);
      await refreshAll();
      setMessage(`索引完成：新增 ${result.indexed} 个文本块。`);
    } catch (error) {
      setMessage(`索引失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function uploadCandidates(candidates: UploadCandidate[], folderName: string, skippedBeforeUpload: number) {
    if (candidates.length === 0) {
      setMessage('没有找到可索引文件。当前仅支持 .md .txt .pdf .docx .csv .xlsx .pptx，且单文件不超过 25MB。');
      return;
    }
    setBusy(true);
    setMessage(`正在上传 ${candidates.length} 个可索引文件到本机后端，已跳过 ${skippedBeforeUpload} 个不适合索引的文件...`);
    try {
      const form = new FormData();
      candidates.forEach(({ file, relativePath }) => {
        form.append('files', file, relativePath);
      });

      const res = await fetch(`${API_BASE}/sources/upload-index`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) throw new Error(await res.text());
      const result = await res.json();
      setFolderPath(`浏览器选择：${folderName}`);
      const status = await apiGet<IndexStatus>('/index/status');
      setIndexStatus(status);
      await refreshAll();
      setMessage(`文件夹已选择并索引：保存 ${result.saved_files} 个文件，后端跳过 ${result.skipped_files ?? 0} 个文件，新增 ${result.indexed} 个文本块。`);
    } catch (error) {
      setMessage(`选择文件夹失败：${String(error)}`);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function uploadSelectedFolder(files: FileList | null) {
    if (!files || files.length === 0) return;
    let totalBytes = 0;
    let skipped = 0;
    const candidates: UploadCandidate[] = [];
    const firstRelativePath = (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath;
    const folderName = firstRelativePath?.split('/')[0] || '浏览器选择的文件夹';

    for (let i = 0; i < files.length; i += 1) {
      const file = files.item(i);
      if (!file) continue;
      const relativePath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      if (!canUploadFile(file) || candidates.length >= maxBrowserFiles || totalBytes + file.size > maxBrowserTotalBytes) {
        skipped += 1;
        continue;
      }
      candidates.push({ file, relativePath });
      totalBytes += file.size;
    }

    await uploadCandidates(candidates, folderName, skipped);
  }

  async function chooseFolderSafely() {
    const picker = (window as unknown as {
      showDirectoryPicker?: (options?: { mode?: 'read' }) => Promise<FileSystemDirectoryHandle>;
    }).showDirectoryPicker;

    if (!picker) {
      fileInputRef.current?.click();
      return;
    }

    setBusy(true);
    setMessage('正在打开文件夹选择器...');
    try {
      const root = await picker({ mode: 'read' });
      const candidates: UploadCandidate[] = [];
      let skipped = 0;
      let totalBytes = 0;

      async function walk(dir: FileSystemDirectoryHandle, prefix: string) {
        if (candidates.length >= maxBrowserFiles || totalBytes >= maxBrowserTotalBytes) return;
        for await (const [name, handle] of (dir as unknown as {
          entries: () => AsyncIterable<[string, FileSystemHandle]>;
        }).entries()) {
          if (name.startsWith('.') || name === 'node_modules') {
            skipped += 1;
            continue;
          }
          const relativePath = prefix ? `${prefix}/${name}` : name;
          if (handle.kind === 'directory') {
            await walk(handle as FileSystemDirectoryHandle, relativePath);
          } else {
            if (!supportedUploadExts.has(fileExt(name))) {
              skipped += 1;
              continue;
            }
            const file = await (handle as FileSystemFileHandle).getFile();
            if (!canUploadFile(file) || candidates.length >= maxBrowserFiles || totalBytes + file.size > maxBrowserTotalBytes) {
              skipped += 1;
              continue;
            }
            candidates.push({ file, relativePath });
            totalBytes += file.size;
          }
        }
      }

      await walk(root, root.name);
      setBusy(false);
      await uploadCandidates(candidates, root.name, skipped);
    } catch (error) {
      setBusy(false);
      const messageText = error instanceof DOMException && error.name === 'AbortError'
        ? '已取消选择文件夹。'
        : `选择文件夹失败：${String(error)}`;
      setMessage(messageText);
    }
  }

  async function askAgent() {
    if (!question.trim()) {
      setMessage('请先输入一个问题。');
      return;
    }
    setBusy(true);
    setMessage(`${activeAgent?.name ?? '智能体'} 正在检索知识库并回答...`);
    setAnswer('');
    setCitations([]);
    try {
      const result = await apiPost<ChatResponse>('/agents/chat', {
        message: question,
        agent_id: selectedAgent,
        session_id: 'vault-default',
        stream: false,
      });
      setAnswer(result.reply);
      setCitations(result.sources ?? []);
      setMessage('回答已生成。');
    } catch (error) {
      setMessage(`问答失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  const pipeline = [
    { title: '添加来源', desc: '授权本地 Vault 或项目目录', done: sources.length > 0 },
    { title: '解析文件', desc: supportedTypes.join(' / '), done: (indexStatus.total_chunks ?? 0) > 0 },
    { title: '建立索引', desc: `${indexStatus.total_chunks ?? 0} chunks`, done: (indexStatus.total_chunks ?? 0) > 0 },
    { title: '智能体问答', desc: '带来源依据的上下文回答', done: Boolean(answer) },
  ];

  return (
    <section id="knowledge-base" className="relative py-20 md:py-32 px-6 md:px-12 bg-[#0D0D0D] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
      <div className="absolute right-[-12%] top-[8%] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute left-[-10%] bottom-[12%] h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-start mb-12">
          <div>
            <span className="reveal text-xs font-medium text-zinc-500 uppercase tracking-[0.3em] mb-4 block">
              Architecture Brain
            </span>
            <h2 className="reveal text-3xl md:text-5xl font-bold text-white tracking-tight mb-5">
              建筑知识库
            </h2>
            <p className="reveal text-zinc-400 leading-relaxed max-w-xl">
              连接你的 Obsidian Vault、本地项目资料与 DeepSeek 智能体，
              让 AI 基于真实项目经验回答问题。当前案例默认读取 Obj-哈尔滨 项目资料。
            </p>
            <p className="reveal text-sm text-zinc-500 leading-relaxed max-w-xl mt-4">
              不再让建筑资料散落在文件夹、PDF 和项目文档中。RMO-AI 会把设计说明、
              规范笔记、会议纪要、材料做法、项目复盘和案例资料转化为可检索、可追问、可引用的专业知识系统。
            </p>
          </div>

          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: FolderOpen, value: '本地目录', label: 'Vault / 项目资料' },
              { icon: Tags, value: '双链标签', label: 'Obsidian 结构' },
              { icon: Bot, value: '多智能体', label: '按任务切换角色' },
              { icon: Lock, value: '本地优先', label: '敏感资料可控' },
            ].map((item) => (
              <div key={item.value} className="bg-[#171717] border border-[#333333]/50 rounded-xl p-4">
                <item.icon size={18} className="text-emerald-400 mb-3" />
                <div className="text-white text-sm font-semibold mb-1">{item.value}</div>
                <div className="text-zinc-500 text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="reveal mb-10 rounded-3xl border border-[#333333]/50 bg-[#111111] p-5 md:p-7">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between mb-7">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">读取本地文件夹</h3>
              <p className="text-sm text-zinc-500 max-w-2xl">
                选择本地 Obsidian Vault 或项目文件夹，系统自动扫描并构建知识索引。浏览器版先使用路径输入，
                后续桌面版会接入系统文件夹选择器。
              </p>
            </div>
            <div className="rounded-xl border border-[#333333]/70 bg-[#0A0A0A] px-4 py-3 font-mono text-xs text-zinc-400 break-all lg:max-w-md">
              <span className="text-zinc-600">路径：</span>{DEFAULT_VAULT}
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {['Markdown', 'PDF', 'Word', 'Excel', 'CSV', 'TXT', 'PPT', 'CAD / Revit 后续支持'].map((format) => (
              <span
                key={format}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  format.includes('后续')
                    ? 'border-zinc-700 text-zinc-500'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                }`}
              >
                {format}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-7">
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Obsidian Vault 深度适配</h4>
              <p className="text-xs text-zinc-500 mb-4">完整理解你的 Obsidian 知识体系，保留双链、标签和文件夹结构。</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {obsidianFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-xl border border-[#333333]/50 bg-[#171717] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <h5 className="text-sm font-medium text-white">{feature.title}</h5>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-500">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">从文件到 AI 问答</h4>
              <p className="text-xs text-zinc-500 mb-4">全自动处理流程，无需手动复制粘贴项目资料。</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {processingFlow.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl border border-[#333333]/50 bg-[#171717] p-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xs font-semibold text-amber-300">
                      {index + 1}
                    </div>
                    <span className="text-sm text-zinc-300">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-7">
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">试试这样提问</h4>
              <p className="text-xs text-zinc-500 mb-4">点击问题会自动填入下方问答框。</p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuestion(item)}
                    className="rounded-full border border-[#333333] bg-[#0E0E0E] px-3 py-2 text-left text-xs text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-300"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Lock size={16} className="text-emerald-400" />
                隐私与数据安全
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {privacyItems.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs leading-relaxed text-zinc-400">
                    <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="reveal rounded-3xl border border-[#333333]/60 bg-[#111111] shadow-2xl shadow-black/40 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#333333]/50 px-5 md:px-7 py-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
              <span>运行于</span>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-zinc-300">
                <FolderOpen size={15} />
                Obj-哈尔滨
                <ChevronDown size={14} />
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-zinc-300">
                <Monitor size={15} />
                本地模式
                <ChevronDown size={14} />
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[#333333] bg-[#1A1A1A] px-3 py-2 text-zinc-300">
                <GitBranch size={15} />
                main
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                backendOnline
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/20 bg-red-500/10 text-red-300'
              }`}>
                <CloudOff size={14} />
                {backendLabel}
              </span>
              <button
                onClick={refreshAll}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                <RefreshCw size={15} />
                刷新连接
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.25fr_0.8fr]">
            <aside className="border-b xl:border-b-0 xl:border-r border-[#333333]/50 p-5 md:p-7">
              <div className="mb-5">
                <h3 className="text-white font-semibold">数据源管理</h3>
                <p className="text-xs text-zinc-500 mt-1">浏览器版先粘贴本地路径；桌面版再接系统文件夹选择器。</p>
              </div>

              <div className="rounded-xl border border-[#333333]/50 bg-[#171717] p-4 mb-4">
                <label className="text-xs text-zinc-500">本地知识库路径</label>
                <input
                  value={folderPath}
                  onChange={(event) => setFolderPath(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#333333] bg-[#0E0E0E] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/60"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {PROJECT_PRESETS.map((preset) => (
                    <button
                      key={preset.path}
                      onClick={() => setFolderPath(preset.path)}
                      className="rounded-full border border-[#333333] px-3 py-1.5 text-xs text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-300"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={supportedTypes.join(',')}
                  className="hidden"
                  onChange={(event) => uploadSelectedFolder(event.target.files)}
                  {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
                />
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={chooseFolderSafely}
                    disabled={busy || !backendOnline}
                    className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-50"
                  >
                    选择文件夹
                  </button>
                  <button
                    onClick={addSource}
                    disabled={busy}
                    className="flex-1 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
                  >
                    添加来源
                  </button>
                  <button
                    onClick={indexFolder}
                    disabled={busy || !backendOnline}
                    className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-black disabled:opacity-50"
                  >
                    开始索引
                  </button>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                  大型项目文件夹建议使用路径索引：先选择或粘贴路径，再添加来源并开始索引。浏览器“选择文件夹”会过滤超大文件，更适合少量文档。
                </p>
              </div>

              <div className="space-y-3">
                {sources.map((source) => (
                  <div key={source.path} className="rounded-xl border border-[#333333]/50 bg-[#171717] p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-sm font-medium text-white">{source.name}</div>
                        <div className="mt-1 text-xs text-zinc-500 break-all">{source.path}</div>
                      </div>
                      <span className={`rounded-full px-2 py-1 text-[11px] whitespace-nowrap ${
                        source.exists && source.readable
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : 'bg-amber-500/10 text-amber-300'
                      }`}>
                        {source.exists && source.readable ? '已授权' : '待确认'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText size={13} />
                        {supportedTypes.join(' ')}
                      </span>
                      <button onClick={() => setFolderPath(source.path)}>使用此路径</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-[#333333]/50 bg-[#141414] p-4">
                <div className="flex items-center gap-2 text-sm text-white mb-3">
                  <Server size={16} className="text-emerald-400" />
                  索引状态
                </div>
                <div className="space-y-2 text-xs text-zinc-500">
                  <div className="flex justify-between"><span>默认模型</span><span>DeepSeek</span></div>
                  <div className="flex justify-between"><span>后端模式</span><span>{indexStatus.backend ?? 'simple'}</span></div>
                  <div className="flex justify-between"><span>文本块</span><span>{indexStatus.total_chunks ?? 0}</span></div>
                  <div className="flex justify-between"><span>文件数</span><span>{indexStatus.total_files ?? 0}</span></div>
                </div>
              </div>
            </aside>

            <main className="p-5 md:p-7 border-b xl:border-b-0 xl:border-r border-[#333333]/50">
              <div className="rounded-2xl border border-[#333333]/70 bg-[#0E0E0E] overflow-hidden mb-6">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="min-h-[150px] w-full resize-none bg-transparent px-5 py-4 text-base text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
                  placeholder="描述计划  @ 引用上下文  / 使用命令"
                />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-[#333333]/50 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={selectedAgent}
                      onChange={(event) => setSelectedAgent(event.target.value)}
                      className="rounded-lg border border-[#333333] bg-[#171717] px-3 py-2 text-sm text-zinc-300 outline-none"
                    >
                      {agents.map((agent) => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                    <button className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5">
                      <Sparkles size={16} />
                      极致
                      <ChevronDown size={14} />
                    </button>
                    <button className="rounded-lg px-3 py-2 text-sm text-zinc-500 hover:text-white hover:bg-white/5">
                      <Link2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={askAgent}
                    disabled={busy || !backendOnline}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
                  >
                    <Send size={16} />
                    运行问答
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                {pipeline.map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-[#333333]/50 bg-[#171717] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-zinc-500">0{index + 1}</span>
                      {step.done ? (
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      ) : (
                        <Search size={16} className="text-amber-400" />
                      )}
                    </div>
                    <div className="text-sm text-white font-medium mb-1">{step.title}</div>
                    <div className="text-xs text-zinc-500 leading-relaxed">{step.desc}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[#333333]/50 bg-[#171717] p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <FileSearch size={17} className="text-amber-400" />
                    {answer ? '知识库回答' : '回答区域'}
                  </div>
                  {message && <span className="text-xs text-zinc-500">{message}</span>}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300 mb-5">
                  {answer || '添加来源并索引后，在上方输入问题，答案会显示在这里。'}
                </p>
                <div className="space-y-2">
                  {citations.map((item) => (
                    <div key={item} className="flex items-start gap-2 rounded-lg bg-[#0E0E0E] px-3 py-2 text-xs text-zinc-500">
                      <Link2 size={13} className="mt-0.5 text-emerald-400 flex-shrink-0" />
                      <span className="break-all">依据：{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            <aside className="p-5 md:p-7">
              <div className="flex items-center gap-2 mb-5">
                <Bot size={18} className="text-purple-400" />
                <div>
                  <h3 className="text-white font-semibold">智能体选择</h3>
                  <p className="text-xs text-zinc-500 mt-1">第一版用不同系统提示词区分角色</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {agents.map((agent) => {
                  const active = agent.id === selectedAgent;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-colors ${
                        active
                          ? 'border-purple-400/40 bg-purple-500/10'
                          : 'border-[#333333]/50 bg-[#171717] hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{agent.name}</span>
                        {active && <CheckCircle2 size={15} className="text-purple-300" />}
                      </div>
                      <span className="text-xs text-zinc-500">RAG + {backendLabel}</span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-[#333333]/50 bg-[#171717] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-white mb-4">
                  <Database size={17} className="text-emerald-400" />
                  MVP 路线
                </div>
                {[
                  '本地 Web + FastAPI',
                  'SQLite 轻量索引',
                  '真实来源引用',
                  '下一步接 Electron 选择文件夹',
                ].map((scope, index) => (
                  <label key={scope} className="flex items-center justify-between py-2 text-sm text-zinc-400">
                    <span>{scope}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${index < 3 ? 'bg-emerald-400' : 'bg-zinc-700'}`} />
                  </label>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};
