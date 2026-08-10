# TEG 秘书成长平台

## 基本信息
- **项目名**：mentor-cert-platform
- **本地路径**：`/Users/lvwen/Documents/claude code/mentor-cert-platform`
- **线上地址**：https://mentor-cert-platform.vercel.app/
- **框架**：Next.js 14 + TypeScript + Tailwind CSS
- **数据库**：PostgreSQL（Neon 云数据库），ORM 用 Prisma
- **部署平台**：Vercel
- **认证**：NextAuth.js

## 项目定位
面向 TEG 部门秘书群体的成长认证平台，分两个角色：
- **导师（mentor）**：完成课程学习 → 自检 → 考试 → 获得导师认证证书
- **新人（newbie）**：完成学习资料 → ABC 成长指标（导师+本人双确认）→ 新人知识测试 → 获得达标勋章

## 技术架构
```
src/
├── app/
│   ├── admin/          # 管理后台（用户/课程/章节/题目/配对/证书管理）
│   ├── api/            # API 路由
│   ├── mentor/         # 导师专区
│   ├── newbie/         # 新人专区
│   ├── dashboard/      # 登录后主页
│   ├── zone/           # 学习资料专区
│   ├── login/          # 登录页
│   └── register/       # 注册页
├── components/         # 通用组件
├── lib/
│   ├── auth.ts         # NextAuth 配置
│   ├── prisma.ts       # Prisma 客户端
│   └── utils.ts
prisma/
└── schema.prisma       # 数据库模型
.github/workflows/      # GitHub Actions（每周自动备份）
```

## 数据库主要模型
- `User` — 用户（learner / admin 角色）
- `Course / Chapter / Question` — 课程体系
- `Progress / Enrollment / ExamAttempt` — 学习进度与考试
- `Certificate / MentorCertificate` — 证书（课程证书 + 导师认证证书）
- `MentorSelfCheck` — 导师自检（check1~4）
- `MentorNewbiePair` — 导师-新人配对
- `NewbieChecklist` — 新人 ABC 成长指标（自评+导师确认）
- `NewbieExam / NewbieBadge` — 新人测试与达标勋章
- `LearningMaterial / LearningProgress` — 学习资料与阅读进度

## 数据库环境隔离（重要）
平台已真实投产，迭代新版本时**严禁影响生产数据**。已做物理隔离：

| 环境 | 连接的库 | Neon host |
|------|---------|-----------|
| 本地 `npm run dev`（读 `.env.local`） | Neon **dev 分支** | `ep-late-star-a1gmsa9t` |
| Vercel 线上（读 Vercel 控制台环境变量） | Neon **main 生产库** | `ep-dawn-boat-a1v0x1bg` |

- dev 分支是生产的 copy-on-write 快照，读写完全独立，改 dev 不回写生产（已实测验证）。
- 生产连接串已备份在 `.env.local.bak-prod`（已 gitignore）。要临时切回生产：`cp .env.local.bak-prod .env.local`。
- 本地 `npx prisma db push` 只作用于 dev 分支。**新版本上线前，对生产库的迁移要单独、谨慎执行**（先看 diff，防丢数据）。
- 判断本地连的是哪个库：看 `.env.local` 里 `POSTGRES_*` 的 host —— `ep-late-star` = dev（安全），`ep-dawn-boat` = 生产（危险）。

## 注意事项
- 数据库连接需要 `.env` 中的 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`（Neon 提供）
- Vercel 环境变量已配置，本地开发用 `.env.local`
- 每次改 schema 后需要 `npx prisma db push` + `npx prisma generate`
- **本地 `.env.local` 的 `NEXTAUTH_URL` 必须是 `http://localhost:3000`**（不能是线上 vercel 地址，否则本地登录后 session cookie 域名对不上，表现为"登录闪一下又弹回登录页"）。此项仅本地用，与线上 Vercel 无关。
- 本地还有另一个不相关项目：`~/seat-platform`（工位管理平台），注意区分
