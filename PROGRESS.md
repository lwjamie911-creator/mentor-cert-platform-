# 开发进度记录

## ✅ 已完成功能

### 基础架构
- [x] Next.js 14 项目初始化，Prisma + Neon PostgreSQL，Vercel 部署
- [x] NextAuth 登录/注册/鉴权，角色权限（learner / admin）

### 学习体系
- [x] 课程管理（Course / Chapter / Question）
- [x] 章节内容支持：Markdown 文本、PDF、外链
- [x] 学习进度追踪（Progress），最少停留时间限制
- [x] 报名机制（Enrollment），含截止日期
- [x] 考试系统（ExamAttempt）：单选、多选、判断、连线题型
- [x] 课程资格证书（Certificate）

### 导师专区
- [x] 导师课程学习页面
- [x] 导师自检面板（check1~4，全部完成后解锁考试）
- [x] 导师认证考试 + 导师认证证书（MentorCertificate）
- [x] 学习资料专区（LearningMaterial，支持 mentor/newbie/both 分区）

### 新人专区
- [x] 新人学习资料浏览
- [x] ABC 成长指标（NewbieChecklist，本人自评 + 导师确认双锁）
- [x] 新人知识测试（NewbieExam）
- [x] 新人达标勋章（NewbieBadge）

### 管理后台
- [x] 用户管理（增删改、批量导入、默认密码 123456）
- [x] 课程/章节/题目 CRUD
- [x] 导师-新人配对管理
- [x] 证书管理
- [x] 管理后台 6 项 UX 优化
- [x] Keep-alive ping（防止 Neon DB 冷启动延迟）

### 数据备份
- [x] 管理后台「导出数据备份」按钮（下载 JSON）
- [x] `/api/admin/backup` 接口（导出用户/资料/自检/证书/进度全量数据）
- [x] GitHub Actions 每周一北京时间 9:00 自动备份，commit 到 `backups/` 目录

---

## 🔜 下一步待办

> 每次开始新任务时，在这里更新：把要做的事写进来，做完后打勾移到「已完成」

- [x] 管理后台学习资料表单新增「内容类型」选择（Markdown / 外链 / PDF）和「链接地址」输入框，修复管理员无法设置/更新课程链接导致用户端 404 的问题
- [x] 修复课程最短阅读时间显示硬编码 10 分钟的问题，改为动态读取 minReadSeconds 字段，管理员修改后前端实时同步
- [x] 修复 vercel.json cron 频率（*/4 * * * * → 0 2 * * *），解决 Hobby 计划限制导致所有部署静默失败的问题

---

## 📝 会话记录

| 日期 | 完成内容 |
|------|---------|
| 2026-04-07 | 项目初始化，完成全站初始版本 |
| 2026-04-07 | 新增学习文档模块、连线题型 |
| 2026-04-07 | 切换 PostgreSQL + 部署 Vercel |
| 2026-04-08 | 修复多项 Neon/Vercel 兼容性问题 |
| 2026-04-08 | 导师功能完善（自检 check4、资料文本支持） |
| 2026-04-09 | 管理后台 6 项 UX 优化，批量导入默认密码改为 123456 |
| 2026-04-10 | 修复课程链接 404：管理员表单补全 contentType/contentUrl 字段 |
| 2026-04-10 | 修复 minReadSeconds 前端硬编码 10 分钟；修复 vercel.json cron 频率导致部署静默失败 |
