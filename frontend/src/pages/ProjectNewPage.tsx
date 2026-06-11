import { useState, type FormEvent, type DragEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Loader2, Plus, Upload, X } from 'lucide-react';
import { createProject, uploadProjectFiles } from '../lib/projectsApi';

export function ProjectNewPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    city: '',
    project_type: '住宅',
    phase: '概念方案',
    description: '',
  });
  const [scale, setScale] = useState('');
  const [ownerNeeds, setOwnerNeeds] = useState('');
  const [deliverGoals, setDeliverGoals] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    setPendingFiles((prev) => [...prev, ...files]);
  }

  function removeFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.city.trim()) {
      setMessage('请填写项目名称和城市');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const desc = [form.description, scale ? `规模：${scale}` : '', ownerNeeds ? `业主诉求：${ownerNeeds}` : '', deliverGoals ? `交付目标：${deliverGoals}` : ''].filter(Boolean).join('\n');
      const project = await createProject({ ...form, description: desc, status: 'active' });
      if (pendingFiles.length) {
        await uploadProjectFiles(project.id, pendingFiles);
      }
      navigate(`/projects/${project.id}`);
    } catch (error) {
      setMessage(`创建失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  const inputCls = 'mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-zinc-200 outline-none focus:border-amber-400/60 transition-colors';
  const labelCls = 'text-xs text-zinc-500';

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-6 pb-20 pt-28 md:px-12">
      <div className="mx-auto max-w-4xl">
        <Link to="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft size={16} />
          返回项目列表
        </Link>

        <div className="mb-8">
          <span className="mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
            New Project
          </span>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white md:text-5xl">新建项目</h1>
          <p className="text-sm leading-7 text-zinc-400">
            创建项目主对象后，文件上传、AI分析、任务拆解和团队配置都将回写到该项目。
          </p>
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm md:p-7">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className={labelCls}>
              项目名称 <span className="text-red-400">*</span>
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={inputCls}
                placeholder="例如：Obj-市庄住宅项目"
              />
            </label>
            <label className={labelCls}>
              城市/区位 <span className="text-red-400">*</span>
              <input
                required
                value={form.city}
                onChange={(event) => setForm({ ...form, city: event.target.value })}
                className={inputCls}
                placeholder="例如：石家庄"
              />
            </label>
            <label className={labelCls}>
              项目类型
              <select
                value={form.project_type}
                onChange={(event) => setForm({ ...form, project_type: event.target.value })}
                className={inputCls}
              >
                {['住宅', '商业', '综合体', '公建', '办公', '酒店', '产业园', '城市更新', '其他'].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              当前阶段
              <select
                value={form.phase}
                onChange={(event) => setForm({ ...form, phase: event.target.value })}
                className={inputCls}
              >
                {['概念方案', '强排/总图', '方案深化', '报规', '施工图配合', '汇报准备'].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              规模
              <input
                value={scale}
                onChange={(event) => setScale(event.target.value)}
                className={inputCls}
                placeholder="例如：12万㎡"
              />
            </label>
          </div>

          <label className={`mt-5 block ${labelCls}`}>
            业主诉求
            <textarea
              value={ownerNeeds}
              onChange={(event) => setOwnerNeeds(event.target.value)}
              className={`${inputCls} min-h-[80px] resize-none`}
              placeholder="记录业主关注点、核心需求..."
            />
          </label>

          <label className={`mt-5 block ${labelCls}`}>
            交付目标
            <textarea
              value={deliverGoals}
              onChange={(event) => setDeliverGoals(event.target.value)}
              className={`${inputCls} min-h-[80px] resize-none`}
              placeholder="项目需要交付的成果..."
            />
          </label>

          <label className={`mt-5 block ${labelCls}`}>
            项目描述
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              className={`${inputCls} min-h-[120px] resize-none`}
              placeholder="记录项目背景、设计目标、当前问题..."
            />
          </label>

          {/* 文件上传区 */}
          <div className="mt-5">
            <div className="mb-2 text-xs text-zinc-500">文件上传（可选）</div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragOver ? 'border-amber-400/60 bg-amber-400/5' : 'border-white/10 bg-white/[0.02]'}`}
            >
              <Upload size={28} className="mx-auto mb-3 text-zinc-500" />
              <p className="mb-2 text-sm text-zinc-400">拖拽文件到此处，或点击选择</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300 hover:border-amber-400/40">
                <Upload size={14} />
                选择文件
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.xlsx,.txt,.md,.png,.jpg,.jpeg,.dwg,.skp"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setPendingFiles((prev) => [...prev, ...files]);
                  }}
                />
              </label>
            </div>
            {pendingFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {pendingFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
                    <span className="text-zinc-300">{file.name}</span>
                    <button type="button" onClick={() => removeFile(index)} className="text-zinc-500 hover:text-red-400">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">{message}</div>}

          <div className="mt-6 flex justify-end gap-3">
            <Link to="/projects" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600">
              取消
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              创建项目
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}