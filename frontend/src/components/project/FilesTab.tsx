import { useState } from 'react';
import { Link } from 'react-router';
import { Clipboard, FolderInput, Upload, FileText, Loader2 } from 'lucide-react';
import { uploadProjectFiles, parseProjectFiles, type ProjectDetail } from '../../lib/projectsApi';

type Props = {
  projectId: string;
  project: ProjectDetail;
  onRefresh: () => void;
};

export function FilesTab({ projectId, project, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedPath, setCopiedPath] = useState('');

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage('');
    try {
      await uploadProjectFiles(projectId, Array.from(files));
      await onRefresh();
      setMessage('新文件已上传并标记为待分析。下一步可以点击"解析文件"。');
    } catch (error) {
      setMessage(`上传失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function onParse() {
    setBusy(true);
    setMessage('');
    try {
      await parseProjectFiles(projectId);
      await onRefresh();
      setMessage('待解析文件已解析完成。旧文件不会重复解析。');
    } catch (error) {
      setMessage(`解析失败：${String(error)}`);
    } finally {
      setBusy(false);
    }
  }

  async function copyPath(path: string) {
    await navigator.clipboard.writeText(path);
    setCopiedPath(path);
    window.setTimeout(() => setCopiedPath(''), 1500);
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black">
          <Upload size={15} />
          上传资料
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.txt,.md,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(event) => onUpload(event.target.files)}
          />
        </label>
        <button
          disabled={busy}
          onClick={onParse}
          className="rounded-lg border border-[#333333] px-3 py-2 text-sm text-zinc-300 hover:border-zinc-600"
        >
          解析文件
        </button>
        <Link
          to={`/inbox?project_id=${projectId}`}
          className="inline-flex items-center gap-2 rounded-lg border border-amber-400/30 px-3 py-2 text-sm text-amber-200 hover:border-amber-300/60"
        >
          <FolderInput size={15} />
          从收件箱导入
        </Link>
      </div>

      {message && (
        <div className="rounded-lg border border-[#333333] bg-[#171717] p-3 text-sm text-zinc-300">
          {busy && <Loader2 size={14} className="mr-2 inline animate-spin" />}
          {message}
        </div>
      )}

      {/* File list */}
      <div className="space-y-3">
        {project.files.map((file) => (
          <div key={file.id} className="rounded-lg border border-[#333333] bg-[#171717] p-4 text-sm text-zinc-300">
            <div className="mb-1 flex items-center gap-2">
              <FileText size={14} className="text-amber-300" />
              <span className="font-medium text-white">{file.filename}</span>
            </div>
            <div className="text-xs text-zinc-500">
              {file.filetype} · {(file.filesize / 1024).toFixed(1)}KB · {file.parse_status} · {file.analysis_status === 'analyzed' ? '已分析' : '待分析'}
            </div>
            <div className="mt-3 rounded-md bg-[#0E0E0E] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-zinc-400">项目资料本地副本路径</span>
                <button
                  onClick={() => copyPath(file.filepath)}
                  className="inline-flex items-center gap-1 rounded-md border border-[#333333] px-2 py-1 text-xs text-zinc-300 hover:border-amber-400/50 hover:text-amber-100"
                >
                  <Clipboard size={13} />
                  {copiedPath === file.filepath ? '已复制' : '复制路径'}
                </button>
              </div>
              <div className="break-all text-xs leading-5 text-zinc-500">{file.filepath}</div>
            </div>
          </div>
        ))}
        {project.files.length === 0 && (
          <p className="text-sm text-zinc-500">暂无文件。点击"上传资料"开始。</p>
        )}
      </div>
    </div>
  );
}
