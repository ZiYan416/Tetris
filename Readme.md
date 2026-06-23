# Neon Blocks - Neon Tetris (Web & Android)

<div align="center">

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=black&style=flat-square)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.0-646CFF?logo=vite&logoColor=white&style=flat-square)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase&logoColor=white&style=flat-square)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

**一款专为现代浏览器和 Android 设备打造的高清、自适应、复古风格俄罗斯方块游戏。**

[在线预览](https://your-app-name.netlify.app) · [报告问题](https://github.com/ZiYan416/Tetris/issues) · [提出改进](https://github.com/ZiYan416/Tetris/pulls)

</div>

---

## 📖 项目简介

**Neon Blocks** 是一款极具现代设计美感又保留了童年情怀的俄罗斯方块游戏。项目采用 **Mono-repo** 单仓库架构设计，前端基于 React + TypeScript + Vite 研发，并封装了原生的 Android 套壳外壳。

本项目的核心亮点在于**极致的自适应体验**：
- 在 **电脑端** 打开时，它是一款自适应屏幕的高清俄罗斯方块网页；
- 在 **移动端（手机浏览器或 Android App）** 打开时，它会瞬间转化为一台精致的**复古经典掌上游戏机**，带给你真实的实体按键触觉反馈与怀旧的视觉效果。

---

## ✨ 核心特性

- 🕹️ **双重自适应布局**：自动检测屏幕尺寸，小屏设备自动激活“复古掌机”外壳，带完整的虚拟 D-Pad 与旋转/加速按键。
- 🎨 **双生主题切换**：
  - **Retro Theme**：绿底黑字的怀旧液晶屏风格，配备经典的扫描线（Scanlines）和 LCD 点阵滤镜。
  - **Cyberpunk Theme**：高饱和的霓虹科幻风格，配合深色暗黑背景与发光特效。
- 🏆 **全球在线排行榜**：基于 **Supabase** 实时数据库，记录不同难度（简单/普通/困难）下的全球排名前十的玩家得分。
- 🌐 **多语言支持**：原生支持中文与英文一键切换，按钮、状态、排行榜全面本地化。
- 📱 **原生 Android 套壳**：轻量级 Java WebView 原生外壳，完美支持沉浸式全面屏隐藏状态栏，本地流畅运行。
- ⌨️ **全键盘/触屏支持**：电脑上支持键盘按键操作（方向键控制，ESC暂停），移动端支持丝滑的 Pointer 事件虚拟按键。

---

## 🛠️ 技术栈

### 前端网页端 (`React Project`)
- **核心框架**：React 18 & TypeScript
- **构建工具**：Vite 5 (极速热重载)
- **样式方案**：Tailwind CSS (响应式与主题控制)
- **图标资源**：Lucide React
- **数据库/后端**：Supabase (实现免服实时排行榜)

### 安卓套壳端 (`Android Project`)
- **核心开发**：Android SDK (Java)
- **布局容器**：ConstraintLayout + WebView
- **优化技术**：沉浸式隐藏状态栏、启用 DOM 存储与 JS 混合内容支持

---

## 🚀 快速开始

### 前提条件

- [Node.js](https://nodejs.org/) (推荐 v18 或更高版本)
- [Android Studio](https://developer.android.com/studio) (仅限开发安卓 App 版本)

---

### 1. 前端网页开发环境配置

1. **克隆仓库**：
   ```bash
   git clone git@github.com:ZiYan416/Tetris.git
   cd Tetris
   ```

2. **安装项目依赖**：
   ```bash
   npm install
   ```

3. **配置环境变量**：
   在根目录下创建一个 `.env.local` 文件，填入你的 Supabase 连接信息：
   ```env
   VITE_SUPABASE_URL=你的_SUPABASE_项目_URL
   VITE_SUPABASE_ANON_KEY=你的_SUPABASE_匿名_ANON_KEY
   ```

4. **启动本地开发服务器**：
   ```bash
   npm run dev
   ```
   启动后，可在浏览器访问：`http://localhost:8080` 进行本地调试。由于开发模式下开启了局域网暴露 (`host: true`)，你也可以在局域网内的其他设备上通过 IP 访问。

5. **项目打包生成**：
   ```bash
   npm run build
   ```
   打包完成后，会将静态文件生成在 `dist/` 文件夹中。

---

### 2. 安卓 App 开发与调试

安卓项目位于根目录的 `/android` 文件夹下，可以直接使用 **Android Studio** 打开。

#### A. 切换调试网址 (重要)
打开文件 `/android/app/src/main/java/com/example/neonblocks/MainActivity.java`：

```java
// 1. 本地联调模式（需先启动本地 React 服务器 npm run dev）：
webView.loadUrl("http://10.0.2.2:8080"); // 10.0.2.2 是安卓模拟器访问宿主机 localhost 的专用 IP

// 2. 生产发布模式（使用 Netlify 部署的线上网页地址）：
// webView.loadUrl("https://your-app-name.netlify.app");
```

#### B. 编译运行
1. 打开 Android Studio 并导入 `android/` 目录。
2. 启动 Android 虚拟设备（AVD）。
3. 点击 **Run** 按钮，App 会自动部署到模拟器中并自动隐藏通知栏和虚拟导航栏，进入沉浸式俄罗斯方块掌机模式。

---

## 🗄️ Supabase 数据库表配置

为使排行榜功能正常运作，你需要在你的 Supabase 数据库中创建以下表格：

### 1. 数据表：`high_scores`

| 列名 | 数据类型 | 默认值 | 允许空 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | bigint (Primary Key) | 自动生成 | 否 | 唯一标识符 |
| `created_at` | timestamp with time zone | now() | 否 | 创建时间 |
| `player_name` | text | - | 否 | 玩家昵称 (最大长度 10 字符) |
| `score` | integer | - | 否 | 游戏得分 |
| `difficulty` | text | - | 否 | 游戏难度 (EASY, NORMAL, HARD) |

### 2. 安全策略 (RLS)
由于是免服的前端直连数据库，请确保开启 `high_scores` 表的 **RLS (Row Level Security)** 策略，并为公众 (anon) 配置以下权限：
- **SELECT**：允许所有用户读取数据（用于排行榜展示）。
- **INSERT**：允许所有用户插入数据（用于玩家上传高分）。
- **UPDATE / DELETE**：拒绝所有用户（防止分数被非法篡改或清空）。

---

## ☁️ Netlify 持续部署 (CI/CD)

项目在推送至 GitHub 时，可以通过 Netlify 开启自动构建。

1. 在 Netlify 新建站点，并关联你的 `ZiYan416/Tetris` GitHub 仓库。
2. 在 **Build settings** 中，进行如下配置：
   - **Base directory**: `留空` (直接使用根目录)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. 在 **Environment variables** 中，配置你第 1 步中相同的 Supabase 环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 点击部署。每次你推送到 `main` 分支，Netlify 将自动重新构建，无需改变安卓端的外壳网址。

---

## 📄 开源许可证

本项目基于 **MIT License** 开源。详情参见 [LICENSE](LICENSE) 文件。
