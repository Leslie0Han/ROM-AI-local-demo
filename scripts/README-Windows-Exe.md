# ROM-AI Windows EXE 打包说明

## 目标

把 ROM-AI 本地 Demo 封装成 Windows 安装包：

```text
release/ROM-AI-Setup-1.0.0.exe
```

用户安装后可从桌面图标打开 ROM-AI，不需要手动启动前端和后端。

## 打包环境

请在 Windows 10/11 x64 上执行打包。

需要提前安装：

- Node.js 20 或更新版本
- Python 3.11-3.12
- PowerShell

## 一键打包

在项目根目录运行：

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\build-windows-exe.ps1
```

如果已经安装过依赖，可以跳过安装：

```powershell
.\scripts\build-windows-exe.ps1 -SkipInstall
```

## 打包产物

打包完成后查看：

```text
release/ROM-AI-Setup-1.0.0.exe
```

这个 exe 是安装包，不是绿色版单文件。安装后会创建桌面快捷方式。

## 数据和配置

安装版不会把数据写入安装目录，而是写入 Windows 用户数据目录：

```text
%APPDATA%\ROM-AI
```

首次启动会自动生成：

- SQLite 数据库
- 上传资料目录
- 后端 `.env`

用户可在应用设置页填写 DeepSeek Key 和腾讯会议 Token。

## 注意

- 当前仓库里的 `backend/.env` 不会进入安装包。
- 本地上传文件、数据库、node_modules、venv 都不会进入安装包。
- 如果腾讯会议或 DeepSeek 不配置密钥，对应功能会提示未配置或使用回退模式。

