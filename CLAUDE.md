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

## 注意事项
- 数据库连接需要 `.env` 中的 `POSTGRES_PRISMA_URL` 和 `POSTGRES_URL_NON_POOLING`（Neon 提供）
- Vercel 环境变量已配置，本地开发用 `.env.local`
- 每次改 schema 后需要 `npx prisma db push` + `npx prisma generate`
- 本地还有另一个不相关项目：`~/seat-platform`（工位管理平台），注意区分
