# ZmoHub

一个简洁的插件分享平台，支持插件展示、分类管理、后台配置等功能。

![ZmoHub Screenshot](./public/images/main.png)

## 功能特性

- **插件展示**：支持分类筛选、搜索、排序
- **插件详情**：展示介绍、下载链接、安装指南
- **后台管理**：管理员登录、插件 CRUD、配置管理
- **动态配置**：站点名称、描述、广告横幅、群聊信息均可后台配置
- **响应式设计**：适配桌面和移动端

## 技术栈

- **框架**: Next.js 15 + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: PostgreSQL
- **字体**: Geist

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/ggggglili/ZmoHub.git
cd zmohub
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

创建 `.env.local` 文件（数据库从 [Neon](https://console.neon.tech/) 获取连接串）：

```env
# 数据库连接（[Neon PostgreSQL](https://neon.tech/)）
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# 管理员账号密码
ADMIN_USERNAME=你的账号
ADMIN_PASSWORD=你的密码
```

### 4. 初始化数据库

启动开发服务器后，访问以下地址初始化数据库表结构：

```
http://localhost:3000/api/init-db
```

看到 `{"success": true, "message": "数据库初始化完成"}` 即表示成功。

成功之后删除 `/app/api/init-db` 文件夹

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看前台页面。

## 使用指南

### 前台访问

- **首页**：欢迎页面，显示站点名称和描述
- **插件列表**：展示所有插件，支持搜索、分类筛选、按热度/时间排序
- **插件详情**：点击插件卡片进入详情页，查看介绍和下载

### 后台管理

访问 http://localhost:3000/zmo-panel/login

使用 `.env.local` 中配置的 `你的账号` 和 `你的密码` 登录。

后台功能：

- **插件管理**：添加、编辑、删除插件
- **站点配置**：修改站点名称和描述（会同步更新页面标题和 SEO）
- **广告配置**：设置首页广告横幅的标题和副标题
- **群聊配置**：设置交流群名称、号码、加群链接

## 部署

### Vercel 部署

1. Fork 本仓库到 GitHub
2. 在 Vercel 导入项目
3. 添加环境变量：`DATABASE_URL`、`你的账号`、`你的密码`
4. 首次部署后访问 `/api/init-db` 初始化数据库

## 目录结构

```
zmohub/
├── app/                    # Next.js 应用代码
│   ├── api/               # API 路由
│   ├── components/        # 公共组件
│   ├── plugins/           # 前台插件页面
│   ├── zmo-panel/         # 后台管理页面
│   └── ...
├── database/              # 数据库脚本
│   └── init.sql          # 表结构定义
├── lib/                   # 工具函数
│   ├── db.ts             # 数据库连接
│   └── rate-limit.ts     # 限流工具
├── public/                # 静态资源
├── env.example           # 环境变量示例
├── LICENSE               # MIT 开源协议
└── README.md             # 项目说明
```

## 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。

## 致谢

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Neon PostgreSQL](https://neon.tech/)
