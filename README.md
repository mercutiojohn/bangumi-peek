# Bangumi Peek

一个现代化的 Bangumi 客户端应用，提供优雅的界面和流畅的使用体验。

## ✨ 特性

- 🎨 多种布局方式
  - 网格布局
  - 海报墙布局
  - 时间线布局
- 🌗 亮色/暗色主题支持
- 📱 响应式设计，支持移动端
- ⚡ 快速响应的用户界面
- 🎯 基于 Shadcn UI 的现代化组件

## 🛠️ 技术栈

- React 19
- TypeScript 5.7
- Vite 6
- TailwindCSS 4
- Radix UI
- Valtio (状态管理)
- React Router 7
- Framer Motion (动画效果)
- Zod (数据验证)

## 📦 安装

确保你的开发环境满足以下要求：
- Node.js 20.0+
- pnpm 8.0+

```bash
# 克隆项目
git clone https://github.com/mercutiojohn/bangumi-peek.git

# 进入项目目录
cd bangumi-peek

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 🚀 构建

```bash
# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 📁 项目结构

```
src/
├── assets/          # 静态资源
├── components/      # React 组件
│   ├── bangumi/    # Bangumi 相关组件
│   ├── layouts/    # 布局组件
│   └── ui/         # UI 基础组件
├── hooks/          # 自定义 React Hooks
├── lib/            # 工具函数库
├── pages/          # 页面组件
├── services/       # API 服务
├── store/          # 状态管理
└── types/          # TypeScript 类型定义
```

## 🔧 开发工具配置

项目使用了以下工具来保证代码质量：

- TypeScript - 类型检查
- ESLint - 代码规范
- Prettier - 代码格式化

## 📝 License

[MIT License](LICENSE)
