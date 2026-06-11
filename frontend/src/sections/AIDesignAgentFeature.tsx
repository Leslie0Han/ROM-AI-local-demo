import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  ImagePlus,
  Loader2,
  Maximize2,
  RefreshCw,
  Send,
  Sparkles,
  Wand2,
  X,
} from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

type DesignImageConfig = {
  provider: string;
  provider_name: string;
  model: string;
  sizes: string[];
  qualities: string[];
  has_key: boolean;
  max_reference_images: number;
  max_reference_image_mb: number;
};

type DesignImageRecord = {
  id: string;
  prompt: string;
  enhanced_prompt: string;
  images: string[];
  provider: string;
  provider_name: string;
  model: string;
  task_id?: string;
  created_at: number;
  size: string;
  quality: string;
  reference_images?: string[];
};

const defaultConfig: DesignImageConfig = {
  provider: 'apimart',
  provider_name: 'APIMart',
  model: 'gpt-image-2',
  sizes: ['1024x1024', '1536x1024', '1024x1536', '2048x1152', '1152x2048'],
  qualities: ['auto', 'low', 'medium', 'high'],
  has_key: false,
  max_reference_images: 4,
  max_reference_image_mb: 25,
};

const promptPresets = [
  {
    title: '总图鸟瞰',
    prompt:
      '为一个北方城市改善型住宅项目生成总图鸟瞰效果图，强调清晰的建筑组团、入口礼序、景观轴线、日照关系和现代高品质住区形象。',
  },
  {
    title: '立面概念',
    prompt:
      '生成住宅立面概念图，强调竖向比例、深色金属线条、浅色石材基座、精致窗墙关系、清晰阴影层次和可落地的材料质感。',
  },
  {
    title: '会所入口',
    prompt:
      '生成现代社区会所入口效果图，强调低调高级的门厅尺度、暖色室内透光、石材与金属结合、入口雨棚和归家仪式感。',
  },
  {
    title: '景观节点',
    prompt:
      '生成住宅区核心景观节点，包含浅水景、廊架、休憩平台、精致铺装和夜间暖光，画面以空间体验和材料细节为主。',
  },
  {
    title: '室内氛围',
    prompt:
      '生成高端住宅大堂室内氛围图，强调石材墙面、木饰面、柔和灯带、艺术装置和安静克制的酒店式空间气质。',
  },
  {
    title: '汇报封面',
    prompt:
      '生成建筑方案汇报封面主视觉，现代住宅项目，建筑轮廓清晰，材质真实，画面留出标题空间，适合PPT首页。',
  },
];

function assetUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `${API_BASE}${url}`;
}

function formatTime(value: number) {
  if (!value) return '';
  return new Date(value * 1000).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || (await res.text()));
  }
  return res.json();
}

async function apiPostForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || (await res.text()));
  }
  return res.json();
}

export const AIDesignAgentFeature: React.FC = () => {
  const [config, setConfig] = useState<DesignImageConfig>(defaultConfig);
  const [history, setHistory] = useState<DesignImageRecord[]>([]);
  const [prompt, setPrompt] = useState(promptPresets[1].prompt);
  const [size, setSize] = useState(defaultConfig.sizes[0]);
  const [quality, setQuality] = useState('auto');
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [references, setReferences] = useState<File[]>([]);
  const [result, setResult] = useState<DesignImageRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const referencePreviews = useMemo(
    () =>
      references.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [references],
  );

  useEffect(() => {
    return () => {
      referencePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [referencePreviews]);

  async function refresh() {
    try {
      const nextConfig = await apiGet<DesignImageConfig>('/design/image/config');
      setConfig(nextConfig);
      setSize((current) => (nextConfig.sizes.includes(current) ? current : nextConfig.sizes[0]));
      setQuality((current) => (nextConfig.qualities.includes(current) ? current : 'auto'));
      const nextHistory = await apiGet<{ items: DesignImageRecord[] }>('/design/image/history');
      setHistory(nextHistory.items);
      setMessage(nextConfig.has_key ? 'APIMart 生图通道已就绪。' : '请先在后端配置 APIMart Key。');
    } catch (error) {
      setMessage(`无法连接生图后端：${String(error)}`);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  function addReferences(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files).filter((file) => file.type.startsWith('image/'));
    const next = [...references, ...selected].slice(0, config.max_reference_images);
    setReferences(next);
  }

  function removeReference(index: number) {
    setReferences((items) => items.filter((_, itemIndex) => itemIndex !== index));
  }

  async function generateImage() {
    setBusy(true);
    setMessage('正在提交 APIMart 生图任务，复杂图像可能需要等待一会儿...');
    try {
      const form = new FormData();
      form.append('prompt', prompt);
      form.append('size', size);
      form.append('quality', quality);
      form.append('enhance_prompt', String(enhancePrompt));
      references.forEach((file) => form.append('reference_images', file));

      const record = await apiPostForm<DesignImageRecord>('/design/image/generate', form);
      setResult(record);
      const nextHistory = await apiGet<{ items: DesignImageRecord[] }>('/design/image/history');
      setHistory(nextHistory.items);
      setMessage('生成完成，结果已保存到本地历史。');
    } catch (error) {
      setMessage(`生成失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  const activeImage = result?.images?.[0] || history[0]?.images?.[0] || '';
  const activeRecord = result || history[0] || null;

  return (
    <section id="ai-design" className="relative bg-[#0A0A0A] px-6 py-20 md:px-12 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="reveal mb-4 block text-xs font-medium uppercase tracking-[0.3em] text-zinc-500">
              Design Agent
            </span>
            <h2 className="reveal mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
              AI设计代理 · 建筑生图工具
            </h2>
            <p className="reveal max-w-3xl text-sm leading-7 text-zinc-400">
              DeepSeek 负责把设计意图转成建筑提示词，APIMart gpt-image-2 负责真实生成图片。结果保存在本机后端，适合方案推敲、汇报封面和立面概念快速试图。
            </p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#333333] bg-[#171717] px-4 py-2 text-sm text-zinc-300 hover:border-zinc-600"
          >
            <RefreshCw size={16} />
            刷新状态
          </button>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            <CheckCircle2 size={14} />
            {config.provider_name} · {config.model}
          </span>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
              config.has_key
                ? 'border-blue-500/20 bg-blue-500/10 text-blue-300'
                : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
            }`}
          >
            <AlertCircle size={14} />
            {config.has_key ? 'Key 已配置' : '等待配置 Key'}
          </span>
          <span className="rounded-full border border-[#333333] px-3 py-1.5 text-xs text-zinc-500">
            参考图最多 {config.max_reference_images} 张，每张 {config.max_reference_image_mb}MB
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.9fr_1.2fr_0.75fr]">
          <aside className="rounded-lg border border-[#333333]/60 bg-[#111111] p-5">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-white">
              <Wand2 size={17} className="text-blue-400" />
              生成参数
            </div>

            <label className="mb-2 block text-xs text-zinc-500">建筑提示词</label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mb-4 min-h-[180px] w-full resize-none rounded-lg border border-[#333333] bg-[#0E0E0E] px-3 py-3 text-sm leading-6 text-zinc-200 outline-none focus:border-blue-500/60"
              placeholder="描述你想生成的建筑画面..."
            />

            <div className="mb-4 grid grid-cols-2 gap-3">
              <label className="text-xs text-zinc-500">
                尺寸
                <select
                  value={size}
                  onChange={(event) => setSize(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#333333] bg-[#0E0E0E] px-3 py-2 text-sm text-zinc-200 outline-none"
                >
                  {config.sizes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-zinc-500">
                画质
                <select
                  value={quality}
                  onChange={(event) => setQuality(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#333333] bg-[#0E0E0E] px-3 py-2 text-sm text-zinc-200 outline-none"
                >
                  {config.qualities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mb-4 flex items-center justify-between rounded-lg border border-[#333333] bg-[#171717] px-3 py-3 text-sm text-zinc-300">
              <span className="inline-flex items-center gap-2">
                <Sparkles size={15} className="text-blue-400" />
                DeepSeek 优化提示词
              </span>
              <input
                type="checkbox"
                checked={enhancePrompt}
                onChange={(event) => setEnhancePrompt(event.target.checked)}
                className="h-4 w-4 accent-blue-500"
              />
            </label>

            <label className="mb-3 block text-xs text-zinc-500">参考图</label>
            <label className="mb-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#444444] bg-[#0E0E0E] px-4 py-4 text-sm text-zinc-400 hover:border-blue-500/60 hover:text-blue-300">
              <ImagePlus size={18} />
              添加参考图
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(event) => addReferences(event.target.files)}
              />
            </label>

            <div className="mb-5 grid grid-cols-4 gap-2">
              {referencePreviews.map((item, index) => (
                <div key={`${item.name}-${index}`} className="relative aspect-square overflow-hidden rounded-lg border border-[#333333]">
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeReference(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                    aria-label="移除参考图"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={generateImage}
              disabled={busy || !config.has_key || !prompt.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
              {busy ? '生成中' : '运行生图'}
            </button>

            {message && <p className="mt-4 text-xs leading-6 text-zinc-500">{message}</p>}
          </aside>

          <main className="rounded-lg border border-[#333333]/60 bg-[#111111] p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white">结果预览</div>
              {activeImage && (
                <a
                  href={assetUrl(activeImage)}
                  download
                  className="inline-flex items-center gap-2 rounded-lg border border-[#333333] px-3 py-2 text-xs text-zinc-300 hover:border-zinc-600"
                >
                  <Download size={14} />
                  下载
                </a>
              )}
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-lg border border-[#333333] bg-[#0B0B0B]">
              {busy && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
                  <Loader2 size={34} className="animate-spin text-blue-300" />
                  <span className="text-xs uppercase tracking-[0.35em] text-zinc-400">Generating</span>
                </div>
              )}
              {activeImage ? (
                <img src={assetUrl(activeImage)} alt="AI design result" className="max-h-[720px] w-full object-contain p-4" />
              ) : (
                <div className="text-center text-zinc-600">
                  <Maximize2 size={40} className="mx-auto mb-4" />
                  <p className="text-xs uppercase tracking-[0.35em]">Canvas Ready</p>
                </div>
              )}
            </div>

            {activeRecord && (
              <div className="mt-4 rounded-lg border border-[#333333]/60 bg-[#171717] p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span>{activeRecord.provider_name || activeRecord.provider}</span>
                  <span>·</span>
                  <span>{activeRecord.model}</span>
                  <span>·</span>
                  <span>{activeRecord.size}</span>
                  <span>·</span>
                  <span>{formatTime(activeRecord.created_at)}</span>
                </div>
                <p className="mb-3 text-sm leading-6 text-zinc-300">{activeRecord.prompt}</p>
                {activeRecord.enhanced_prompt && activeRecord.enhanced_prompt !== activeRecord.prompt && (
                  <details className="text-xs leading-6 text-zinc-500">
                    <summary className="cursor-pointer text-zinc-400">查看 DeepSeek 优化后的提示词</summary>
                    <p className="mt-2 whitespace-pre-wrap">{activeRecord.enhanced_prompt}</p>
                  </details>
                )}
              </div>
            )}
          </main>

          <aside className="rounded-lg border border-[#333333]/60 bg-[#111111] p-5">
            <div className="mb-5 text-sm font-semibold text-white">建筑场景预设</div>
            <div className="mb-6 space-y-2">
              {promptPresets.map((item) => (
                <button
                  key={item.title}
                  onClick={() => setPrompt(item.prompt)}
                  className="w-full rounded-lg border border-[#333333] bg-[#171717] px-3 py-3 text-left text-sm text-zinc-300 hover:border-blue-500/40 hover:text-blue-200"
                >
                  {item.title}
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">历史图库</span>
              <button onClick={refresh} className="text-xs text-zinc-500 hover:text-zinc-300">
                刷新
              </button>
            </div>
            <div className="space-y-3">
              {history.length === 0 && (
                <div className="rounded-lg border border-[#333333] bg-[#171717] p-4 text-xs leading-6 text-zinc-500">
                  还没有生成记录。完成第一张图后，这里会显示本地历史。
                </div>
              )}
              {history.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setResult(item)}
                  className="flex w-full gap-3 rounded-lg border border-[#333333] bg-[#171717] p-2 text-left hover:border-blue-500/40"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-[#0B0B0B]">
                    {item.images?.[0] && (
                      <img src={assetUrl(item.images[0])} alt={item.prompt} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 truncate text-xs text-zinc-300">{item.prompt}</div>
                    <div className="text-[11px] text-zinc-600">{formatTime(item.created_at)}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};
