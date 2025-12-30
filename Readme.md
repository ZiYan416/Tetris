<div align="center">
  <br />
  <h1>🧱 Neon Tetris Mobile</h1>
  <h3>Retro · Cyberpunk Aesthetics · 俄罗斯方块</h3>
  <p>
    A high-fidelity, mobile-first Tetris clone featuring a dual visual engine, touch-optimized controls, and seamless Android integration.
  </p>

  <p align="center">
    <a href="#-english">English</a> | <a href="#-中文">中文</a>
  </p>
</div>
---

## 这个项目是Tetris的React部分。配置请参考NEON-TETRIS-MOBILE的Readme文件
<a name="-english"></a>
## 📖 About The Project

**Neon Tetris Mobile** is a hybrid application that bridges the gap between modern web technologies and native mobile experiences. Built with **React 19** and **TypeScript**, it runs within a native **Android WebView** container to provide an immersive, full-screen gaming experience.

The project features a unique **Dual Visual Engine**:
1.  **Retro Mode:** A soothing, Morandi-color palette inspired by vintage handheld consoles, designed to reduce eye strain.
2.  **Cyberpunk Mode:** A high-contrast, neon-glowing aesthetic with dynamic lighting effects for a futuristic feel.

### ✨ Key Features

*   **Hybrid Architecture:** React frontend running inside a native Android Java wrapper.
*   **Touch Optimization:** Custom virtual D-Pad and action buttons with 0-latency response.
*   **Responsive Grid:** Dynamically calculates grid dimensions to fit any device aspect ratio.
*   **Global Leaderboard:** Real-time high scores powered by **Supabase**.
*   **Robust Network Handling:** Auto-retry logic for WebView connections (handling local dev server delays).
*   **Immersive Mode:** Hides Android system bars for a console-like experience.

## 🛠 Tech Stack

*   **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
*   **Mobile:** Android SDK (Java), WebView, AndroidX
*   **Backend:** Supabase (PostgreSQL)
*   **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18+)
*   **Android Studio** (Koala or newer recommended)
*   **JDK 11+**

### 1. Web Development Setup

First, you need to run the React application locally.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/neon-tetris-mobile.git
    cd neon-tetris-mobile
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Start the Dev Server:**
    ```bash
    npm run dev
    ```
    *Note: The server runs on port `8080` by default to match the Android configuration.*

### 2. Android Studio Setup

To run the app on an Android Emulator:

1.  **Open the Project:**
    *   Launch Android Studio.
    *   Select **Open** and choose the `android` folder inside the project root.

2.  **Sync Gradle:**
    *   Allow Android Studio to download necessary SDK tools and sync Gradle dependencies.

3.  **Configure Network (Important):**
    *   The `MainActivity.java` is currently configured to point to `http://10.0.2.2:8080`.
    *   `10.0.2.2` is the special alias address for the Android Emulator to access your computer's `localhost`.
    *   **Ensure your React app (`npm run dev`) is running before launching the Android app.**

4.  **Run the App:**
    *   Select a Virtual Device (AVD) or connect a physical device via USB.
    *   Click the **Run** (Green Play) button.

*(If using a physical device, you must change `APP_URL` in `MainActivity.java` to your computer's local IP address, e.g., `http://192.168.1.5:8080`)*

## 📦 Deployment

### Web Deployment
To deploy the game as a standalone PWA or web app:
```bash
npm run build
```
Upload the contents of the `dist` folder to Vercel, Netlify, or your preferred static host.

### Android Release
1.  **Update URL:** In `android/app/src/main/java/.../MainActivity.java`, change `APP_URL` from localhost to your deployed web URL (e.g., `https://neon-tetris.vercel.app`).
2.  **Generate Signed APK:**
    *   Go to **Build** -> **Generate Signed Bundle / APK**.
    *   Create a keystore and follow the wizard to produce a release APK.

---

<a name="-中文"></a>

## 📖 项目简介

**Neon Tetris Mobile (霓虹方块)** 是一个融合现代 Web 技术与原生移动体验的混合应用。它使用 **React 19** 和 **TypeScript** 构建核心逻辑，并通过 **Android WebView** 容器运行，提供沉浸式的全屏游戏体验。

本项目拥有一套独特的 **双重视觉引擎**：
1.  **复古模式 (Retro):** 采用莫兰迪色系的怀旧掌机风格，视觉柔和，适合长时间游玩。
2.  **赛博模式 (Cyberpunk):** 高对比度的霓虹辉光风格，伴随动态光影，极具未来感。

### ✨ 核心功能

*   **混合架构:** React 前端无缝嵌入原生 Android Java 容器。
*   **触控优化:** 专为手机设计的零延迟虚拟十字键与操作按钮。
*   **自适应网格:** 智能计算屏幕尺寸，适配任意比例的 Android 设备。
*   **全球排行榜:** 基于 **Supabase** 的实时分数同步。
*   **健壮的网络处理:** 内置 WebView 自动重连机制（支持断网重试与超时处理）。
*   **沉浸模式:** 自动隐藏系统状态栏与导航栏，实现真·全屏体验。

## 🛠 技术栈

*   **前端:** React 19, TypeScript, Tailwind CSS, Vite
*   **移动端:** Android SDK (Java), WebView, AndroidX
*   **后端:** Supabase (PostgreSQL)
*   **图标库:** Lucide React

## 🚀 快速开始

### 环境要求
*   **Node.js** (v18+)
*   **Android Studio** (建议 Koala 或更新版本)
*   **JDK 11+**
*   请注意！**不要**将你的项目配置在***中文（或带有任何非ASCII码）***的路径下！

### 1. Web 前端配置

首先需要在本地运行 React 应用。

1.  **克隆仓库:**
    ```bash
    git clone https://github.com/your-username/neon-tetris-mobile.git
    cd neon-tetris-mobile
    ```

2.  **安装依赖:**
    ```bash
    npm install
    ```

3.  **配置环境变量:**
    在根目录创建 `.env` 文件:
    ```env
    VITE_SUPABASE_URL=你的_supabase_url
    VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
    ```

4.  **启动开发服务器:**
    ```bash
    npm run dev
    ```
    *注意：服务器默认运行在 `8080` 端口，以便与 Android 配置匹配。*

### 2. Android Studio 配置

要在 Android 模拟器上运行应用：

1.  **打开项目:**
    *   启动 Android Studio。
    *   选择 **Open** 并选中项目根目录下的 `android` 文件夹。

2.  **Gradle 同步:**
    *   等待 Android Studio 下载必要的 SDK 工具并完成 Gradle 同步。

3.  **网络配置 (重要):**
    *   `MainActivity.java` 目前配置为连接 `http://10.0.2.2:8080`。
    *   `10.0.2.2` 是 Android 模拟器访问电脑本机 `localhost` 的特殊别名地址。
    *   **在启动 Android App 之前，请确保你的 React 服务 (`npm run dev`) 正在运行。**
*   *或者，当你的服务跑在互联网上时，你也可以使用域名来连接。*
    
4.  **运行应用:**
    *   选择一个虚拟设备 (AVD) 或通过 USB 连接真机。
    *   点击 **Run** (绿色三角形) 按钮。

*(如果使用真机调试，你需要将 `MainActivity.java` 中的 `APP_URL` 修改为你电脑的局域网 IP 地址，例如 `http://192.168.1.5:8080`)*

## 📦 部署指南

### Web 发布
若要将游戏作为独立 PWA 或网页发布：
```bash
npm run build
```
将 `dist` 文件夹的内容上传至 Vercel, Netlify 或你的静态服务器。

### Android 打包发布
1.  **更新地址:** 修改 `android/app/src/main/java/.../MainActivity.java` 中的 `APP_URL`，将其从 localhost 改为你的线上部署地址（如 `https://neon-tetris.vercel.app`）。
2.  **生成签名 APK:**
    *   点击菜单栏 **Build** -> **Generate Signed Bundle / APK**。
    *   创建密钥库 (Keystore) 并按照向导生成 Release 版本的 APK 文件。

---

Designed & Developed with ❤️ by [荔冰酪]
