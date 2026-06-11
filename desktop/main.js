const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const waitOn = require('wait-on');

let backendProcess = null;
let mainWindow = null;

const BACKEND_PORT = 8000;

function ensureUserEnv() {
  const dataDir = path.join(app.getPath('userData'), 'backend-data');
  const uploadsDir = path.join(dataDir, 'uploads');
  const cloudDir = path.join(dataDir, 'cloud');
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(cloudDir, { recursive: true });

  const envPath = path.join(dataDir, '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(
      envPath,
      [
        'DEEPSEEK_API_KEY=',
        'DEEPSEEK_BASE_URL=https://api.deepseek.com',
        'DEEPSEEK_MODEL=deepseek-chat',
        'TENCENT_MEETING_TOKEN=',
        'DEFAULT_VAULT_PATH=',
        `UPLOAD_ROOT=${uploadsDir.replace(/\\/g, '\\\\')}`,
        'CLOUD_UPLOAD_ENABLED=false',
        `CLOUD_UPLOAD_ROOT=${cloudDir.replace(/\\/g, '\\\\')}`,
        `DATABASE_URL=sqlite:///${path.join(dataDir, 'rmo_ai.db').replace(/\\/g, '/')}`,
        '',
      ].join('\n'),
      'utf8',
    );
  }

  return { dataDir, envPath };
}

function resolveBackendExe() {
  const candidates = [
    path.join(process.resourcesPath, 'app.asar.unpacked', 'backend', 'rom-ai-backend.exe'),
    path.join(process.resourcesPath, 'backend', 'rom-ai-backend.exe'),
    path.join(__dirname, '..', 'backend_dist', 'rom-ai-backend.exe'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate));
}

async function startBackend() {
  const backendExe = resolveBackendExe();
  if (!backendExe) {
    throw new Error('未找到后端程序 rom-ai-backend.exe，请先运行 Windows 打包脚本。');
  }

  const { dataDir, envPath } = ensureUserEnv();
  backendProcess = spawn(backendExe, [], {
    cwd: dataDir,
    env: {
      ...process.env,
      ROM_AI_ENV_FILE: envPath,
      ROM_AI_BASE_DIR: dataDir,
    },
    windowsHide: true,
  });

  backendProcess.on('exit', (code) => {
    if (code !== 0 && mainWindow) {
      mainWindow.webContents.send('backend-exit', code);
    }
  });

  await waitOn({
    resources: [`http://127.0.0.1:${BACKEND_PORT}/api/health`],
    timeout: 30000,
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    title: 'ROM-AI',
    backgroundColor: '#0A0A0A',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const indexPath = path.join(__dirname, 'frontend', 'index.html');
  mainWindow.loadFile(indexPath);
}

app.whenReady().then(async () => {
  try {
    await startBackend();
    createWindow();
  } catch (error) {
    dialog.showErrorBox('ROM-AI 启动失败', String(error && error.message ? error.message : error));
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  app.quit();
});
