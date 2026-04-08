import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建管理员
  const adminPwd = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: '管理员',
      email: 'admin@example.com',
      password: adminPwd,
      role: 'admin',
      status: 'active',
    },
  })

  const learnerPwd = await bcrypt.hash('test123', 10)

  // 测试账号1
  const mentor = await prisma.user.upsert({
    where: { email: 'testuser1@example.com' },
    update: {},
    create: {
      name: 'testuser1',
      email: 'testuser1@example.com',
      password: learnerPwd,
      role: 'learner',
      status: 'active',
    },
  })

  // 测试账号2
  const newbie = await prisma.user.upsert({
    where: { email: 'testuser2@example.com' },
    update: {},
    create: {
      name: 'testuser2',
      email: 'testuser2@example.com',
      password: learnerPwd,
      role: 'learner',
      status: 'active',
    },
  })

  // 创建示例课程
  const course = await prisma.course.upsert({
    where: { id: 'course-demo' },
    update: {},
    create: {
      id: 'course-demo',
      title: '企业导师基础认证',
      description: '本课程涵盖导师职责、辅导技巧和学员管理等核心内容，完成后可获得企业导师基础认证资质。',
      deadlineDays: 30,
      orderIndex: 0,
      isPublished: true,
    },
  })

  // 创建章节
  const chapter1 = await prisma.chapter.upsert({
    where: { id: 'chapter-1' },
    update: {},
    create: {
      id: 'chapter-1',
      courseId: course.id,
      title: '导师角色与职责',
      contentType: 'text',
      contentText: `# 导师角色与职责

## 什么是企业导师？

企业导师是指在组织内部，通过**知识传授、经验分享和技能指导**，帮助新员工或初级员工快速成长的资深员工。

## 导师的核心职责

### 1. 知识传授
- 分享专业知识和行业经验
- 解答学员在工作中遇到的疑问
- 提供实用的工作方法和技巧

### 2. 职业发展指导
- 帮助学员制定职业发展规划
- 分析学员的优势与待提升领域
- 提供成长建议和反馈

### 3. 文化传承
- 传递企业文化和价值观
- 帮助学员快速融入团队
- 建立良好的职场行为规范

## 导师与管理者的区别

| 维度 | 导师 | 管理者 |
|------|------|--------|
| 关系 | 伙伴式 | 上下级 |
| 目标 | 个人成长 | 绩效达成 |
| 时间 | 长期陪伴 | 任务导向 |

> 成为好导师，首先要有**耐心**和**同理心**，站在学员的角度思考问题。`,
      minReadSeconds: 60,
      orderIndex: 0,
      isRequired: true,
    },
  })

  const chapter2 = await prisma.chapter.upsert({
    where: { id: 'chapter-2' },
    update: {},
    create: {
      id: 'chapter-2',
      courseId: course.id,
      title: '有效的辅导技巧',
      contentType: 'text',
      contentText: `# 有效的辅导技巧

## GROW 辅导模型

GROW 是国际通用的辅导模型，包含四个步骤：

### G - Goal（目标）
明确学员希望达成的目标
- "你希望在这次辅导中达到什么目标？"
- "完成后你期待看到什么变化？"

### R - Reality（现状）
了解目前的实际情况
- "目前你在这个方面做得怎么样？"
- "已经尝试过哪些方法？"

### O - Options（选项）
探索可能的解决方案
- "有哪些方法可以帮助你达成目标？"
- "还有什么其他可能性？"

### W - Will（意愿）
确定行动计划和承诺
- "你打算采取哪些具体行动？"
- "什么时候开始，怎么衡量进展？"

## 倾听的艺术

**积极倾听**不只是听内容，还要注意：
1. 肢体语言（点头、眼神接触）
2. 情感回应（"我理解你的感受"）
3. 复述确认（"你的意思是..."）
4. 开放式提问（"能具体说说吗？"）`,
      minReadSeconds: 90,
      orderIndex: 1,
      isRequired: true,
    },
  })

  // 创建章节题目
  await prisma.question.createMany({
    data: [
      {
        id: 'q1',
        chapterId: chapter1.id,
        type: 'single',
        content: '以下哪项不是企业导师的核心职责？',
        options: JSON.stringify(['知识传授', '绩效考核', '职业发展指导', '文化传承']),
        answer: JSON.stringify(['B']),
        explanation: '绩效考核是管理者的职责，导师侧重于个人成长和知识传授。',
        difficulty: 1,
      },
      {
        id: 'q2',
        chapterId: chapter1.id,
        type: 'truefalse',
        content: '导师和管理者的工作目标是完全一样的。',
        options: JSON.stringify(['正确', '错误']),
        answer: JSON.stringify(['B']),
        explanation: '导师关注学员个人成长，管理者侧重绩效达成，两者目标不同。',
        difficulty: 1,
      },
      {
        id: 'q3',
        chapterId: chapter2.id,
        type: 'single',
        content: 'GROW 辅导模型中，"O" 代表什么？',
        options: JSON.stringify(['目标', '现状', '选项', '意愿']),
        answer: JSON.stringify(['C']),
        explanation: 'GROW 分别代表 Goal(目标)、Reality(现状)、Options(选项)、Will(意愿)。',
        difficulty: 2,
      },
      {
        id: 'q4',
        chapterId: chapter2.id,
        type: 'multiple',
        content: '积极倾听包括以下哪些要素？（多选）',
        options: JSON.stringify(['肢体语言', '情感回应', '打断对方', '开放式提问']),
        answer: JSON.stringify(['A', 'B', 'D']),
        explanation: '积极倾听应注意肢体语言、情感回应和提问技巧，不应打断对方。',
        difficulty: 2,
      },
    ],
  })

  // 创建期末考题
  await prisma.question.createMany({
    data: [
      {
        id: 'fq1',
        courseId: course.id,
        type: 'single',
        content: '成为好导师最重要的素质是什么？',
        options: JSON.stringify(['专业技能强', '耐心和同理心', '管理经验丰富', '学历高']),
        answer: JSON.stringify(['B']),
        explanation: '导师需要站在学员角度思考，耐心和同理心是基础。',
        difficulty: 1,
      },
      {
        id: 'fq2',
        courseId: course.id,
        type: 'truefalse',
        content: 'GROW 模型中，第一步是了解学员的现状。',
        options: JSON.stringify(['正确', '错误']),
        answer: JSON.stringify(['B']),
        explanation: 'GROW 第一步是 Goal（目标），要先明确目标，再了解现状。',
        difficulty: 2,
      },
      {
        id: 'fq3',
        courseId: course.id,
        type: 'multiple',
        content: '导师与管理者的区别体现在哪些方面？（多选）',
        options: JSON.stringify(['关系性质不同', '工作目标不同', '薪资水平不同', '时间导向不同']),
        answer: JSON.stringify(['A', 'B', 'D']),
        explanation: '导师与管理者的区别在于关系（伙伴vs上下级）、目标（成长vs绩效）和时间导向（长期vs任务）。',
        difficulty: 2,
      },
    ],
  })

  console.log('✅ 种子数据创建成功')
  console.log('管理员账号:   admin@example.com     / admin123')
  console.log('测试账号1:    testuser1@example.com / test123')
  console.log('测试账号2:    testuser2@example.com / test123')
  console.log('')
  console.log('💡 测试导师-新人交互流程：')
  console.log('   1. testuser2 登录 → 新人专区 → 绑定导师（输入 testuser1 的企微ID）')
  console.log('   2. testuser1 登录 → 导师专区 → 完成自检 → 完成测试 → 我的新人中确认 ABC 指标')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
