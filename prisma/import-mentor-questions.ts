import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// 导师认证题库 v3.0 完整版（34道）
// 连线题 options = 左侧项数组，answer = 右侧项数组（顺序与左侧对应）
// 选择/判断题 options = 选项文字数组（不含ABCD前缀），answer = 正确选项字母数组

const questions = [
  // ══════════════ 连线题 5道 ══════════════
  {
    type: 'matching',
    content: '请将以下TEG部门与其核心职能进行匹配：',
    options: JSON.stringify(['计费平台部', '网络平台部', '大语言模型部', 'IDC平台部']),
    answer: JSON.stringify([
      '负责产品端到端交易平台，为王者荣耀、微信游戏等提供支付与收款服务',
      '负责腾讯全球网络规划设计、云网络研发及高性能计算网络星脉芯片研发',
      '聚焦腾讯混元大语言模型技术，构建基于大模型的AI PaaS中台能力',
      '负责腾讯全球超过24个主要地区数据中心全生命周期管理，支撑百万量级服务器运营',
    ]),
  },
  {
    type: 'matching',
    content: '请将以下TEG部门与其核心职能进行匹配：',
    options: JSON.stringify(['信息安全部', '客户服务部', '安全平台部', '研发管理部']),
    answer: JSON.stringify([
      '承担保障腾讯产品、业务和核心数据安全的重任，具备行业领先的音视图文AI能力',
      '依托互联网技术建设多元化服务渠道，智能化解决用户问题，传递用户心声',
      '成立于2005年，聚焦大模型安全、广告安全、DDoS防护、数据安全等领域',
      '为腾讯研发运营团队提供全面研效产品服务，旗下产品包括TAPD、工蜂、北极星等',
    ]),
  },
  {
    type: 'matching',
    content: '请将以下TEG部门与其核心职能进行匹配：',
    options: JSON.stringify(['云架构平台部', 'AI Infra部', '数据计算平台部', '企业IT部']),
    answer: JSON.stringify([
      '研发对象存储、块存储等产品，并构建全球加速引擎，自研编解码芯片和AI软件栈',
      '负责大模型训练及推理平台技术能力建设，聚焦大规模分布式训练、高性能推理',
      '负责司内统一大数据和机器学习的数据智能融合平台建设，提供PaaS平台底座',
      '为腾讯集团打造遍布全球的安全稳定IT办公环境，用自研SOC构建数字化基座',
    ]),
  },
  {
    type: 'matching',
    content: '请将以下TEG部门与其核心职能进行匹配：',
    options: JSON.stringify(['AI Lab', 'AI平台部', 'Robotics X', '运营管理部']),
    answer: JSON.stringify([
      '腾讯公司级AI实验室，聚焦AGI/ASI领域前沿探索，研究成果应用于混元、元宝等产品',
      '聚焦决策AI和生成式AI，研发出棋牌AI绝艺及MOBA游戏AI绝悟',
      '腾讯公司级机器人实验室，以养老服务为切入点，研究灵敏运动、灵巧操作、具身智能',
      '致力于提升云基础设施资源运营效率，管理全球24个区域62个可用区的服务器与IDC资源',
    ]),
  },
  {
    type: 'matching',
    content: '请将以下TEG部门与其核心职能进行匹配：',
    options: JSON.stringify(['数据库研发部', 'AI Data部', '多模态模型部', '网络平台部']),
    answer: JSON.stringify([
      '研发和运营可靠高效低成本的数据库技术产品，旗下涵盖金融级分布式、云原生等多引擎体系',
      '负责大模型数据及评测体系建设，构建数据抓取、清洗、标注、合成等系统',
      '负责探索图像、视频、3D、数字人等多模态大模型技术前沿，赋能游戏、广告等业务场景',
      '负责腾讯全球网络规划与设计，自研高性能计算网络星脉和智能网卡芯片玄灵',
    ]),
  },

  // ══════════════ 多选题 7道 ══════════════
  {
    type: 'multiple',
    content: '秘书「团队建设」模块包含哪些工作？（多选）',
    options: JSON.stringify([
      '员工生日、婚育、入职周年等关怀类活动组织',
      '组织策划部门年会及团建活动',
      '部门庆功表彰、业务里程碑等活动策划',
      '大型项目冲刺、封闭驻场的保障性行政支持',
    ]),
    answer: JSON.stringify(['A', 'B', 'C', 'D']),
  },
  {
    type: 'multiple',
    content: '秘书「公共支持」模块可能涉及哪些内容？（多选）',
    options: JSON.stringify([
      '管理大会、员工大会、中高干offsite等BG/业务线级公共项目',
      '参与秘书通道项目，如通道活动支持、专业课程开发',
      '参与BG秘书团队招聘及新人培养工作',
      '负责所有部门的财务预算审批',
    ]),
    answer: JSON.stringify(['A', 'B', 'C']),
  },
  {
    type: 'multiple',
    content: 'TEG秘书团队内共设哪三类虚拟小组？（多选）',
    options: JSON.stringify(['学习小组', '内务小组', '组织小组', '宣传小组']),
    answer: JSON.stringify(['A', 'B', 'C']),
  },
  {
    type: 'multiple',
    content: '根据导师手册，导师职责包含哪六大关键词？（多选）',
    options: JSON.stringify([
      '计划（Planing）与答疑（Advising）',
      '反馈（Feedback）与培养（Training）',
      '融入（Integration）与考察（Assessing）',
      '激励（Motivating）与评级（Rating）',
    ]),
    answer: JSON.stringify(['A', 'B', 'C']),
  },
  {
    type: 'multiple',
    content: '以下哪些属于导师的黑导师负向行为？（多选）',
    options: JSON.stringify([
      '新人入职前完全不联系，入职时只做简单介绍后任由其自我学习',
      '没有明确培养计划，不跟进进度，拒绝讨论',
      '只把新人当廉价劳动力，职场PUA，经常否定新人',
      '定期1v1沟通，提供具体行动建议',
    ]),
    answer: JSON.stringify(['A', 'B', 'C']),
  },
  {
    type: 'multiple',
    content: '以下哪些属于导师在行为管理中的合规底线？（多选）',
    options: JSON.stringify([
      '不可有体罚、辱骂行为，对实习生也应遵守干部六条',
      '不可将自己的系统账号借给新人使用',
      '可以私下随意评论他人的薪酬和绩效',
      '禁止代替实习生签到打卡',
    ]),
    answer: JSON.stringify(['A', 'B', 'D']),
  },
  {
    type: 'multiple',
    content: '以下哪些是秘书日常行政支持的工作内容？（多选）',
    options: JSON.stringify([
      '协助员工入离职及转岗手续办理',
      '部门考勤异常数据统计与跟进',
      '部门办公耗材/设备的采购与管理',
      '代替主管审批员工绩效评分',
    ]),
    answer: JSON.stringify(['A', 'B', 'C']),
  },

  // ══════════════ 单选题 17道 ══════════════
  {
    type: 'single',
    content: '腾讯部门秘书的核心岗位定位是？',
    options: JSON.stringify([
      '以业务策划为主，接口各职能部门',
      '以行政类工作为主，接口财务、采购、人力资源等工作',
      '以人力资源管理为主，统筹团队绩效',
      '以财务管控为主，负责部门预算执行',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '秘书「管理支持」模块中，日程管理支持的主要对象是？',
    options: JSON.stringify([
      '所有正式员工',
      '集团正式任命发文的中层管理干部',
      '工作年限满3年的员工',
      '所有专业职级10级及以上员工',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '以下哪项属于秘书「信息管理」模块的工作内容？',
    options: JSON.stringify([
      '组织策划部门年会及团建活动',
      '部门邮件组/企微群/微信群的维护管理',
      '协助员工入离职流程及考勤管理',
      '部门办公空间资源协调及功能维护',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: 'TEG秘书中心的核心理念是？',
    options: JSON.stringify([
      '专业、服务、伙伴',
      '务实、高效、协同',
      '创新、协作、共赢',
      '精准、高效、创新',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: 'TEG秘书中心在白皮书中被定位为TEG人信赖的什么角色？（选出全部正确描述）',
    options: JSON.stringify([
      '部门大管家、业务助推器',
      '关怀好伙伴及BG事务勤帮手',
      '团队绩效官及部门决策者',
      '以上A和B均正确',
    ]),
    answer: JSON.stringify(['D']),
  },
  {
    type: 'single',
    content: 'TEG（技术工程事业群）的英文全称是？',
    options: JSON.stringify([
      'Technology and Engineering Group',
      'Technical Enterprise Group',
      'Tencent Engineering Group',
      'Technology Excellence Group',
    ]),
    answer: JSON.stringify(['A']),
  },
  {
    type: 'single',
    content: 'TEG的核心理念是？',
    options: JSON.stringify([
      '创新、效率、共赢',
      '专业、服务、伙伴',
      '务实、高效、协同',
      '安全、稳定、可靠',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '根据导师手册，导师的核心定位是？',
    options: JSON.stringify([
      '新人绩效考核的主责人',
      '新人岗位胜任的引路人',
      '新人薪酬调整的决策者',
      '新人日常考勤的管理者',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: 'GROW教练模型中，R代表什么？',
    options: JSON.stringify([
      '结果（Result）',
      '现状（Reality）',
      '资源（Resource）',
      '回顾（Review）',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '导师辅导周期中，破冰融入期的核心任务是什么？',
    options: JSON.stringify([
      '布置大量独立任务考验新人能力',
      '带领新人认识团队同事、完成首次面谈与辅导计划共识',
      '直接进行试用期考核评估',
      '安排新人参加对外商务活动',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '实习生导师与校招新人导师的辅导侧重点，主要区别在于？',
    options: JSON.stringify([
      '实习生导师无需关注新人融入，只关注业务产出',
      '实习生导师需额外协助上级做留用考察与关系保温',
      '实习生导师不需要制定辅导计划',
      '校招新人导师不参与转正评估',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '试用期管理中，导师需要在试用期结束前多久做出通过与否的决策？',
    options: JSON.stringify([
      '至少提前三天',
      '至少提前一周',
      '至少提前两周',
      '至少提前一个月',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '以下哪项属于秘书「资源管理」模块的工作内容？',
    options: JSON.stringify([
      '部门邮件组/企微群的维护',
      '协助员工入离职及考勤管理',
      '部门办公空间资源协调及功能维护',
      '组织策划年会及团建活动',
    ]),
    answer: JSON.stringify(['C']),
  },
  {
    type: 'single',
    content: '在导师辅导的「上手成长期」，导师的核心任务是？',
    options: JSON.stringify([
      '带领新人认识团队、完成首次面谈',
      '聚焦业务辅导，同步开展能力评估，定期给予反馈',
      '准备离职交接及绩效总结',
      '安排新人独立负责所有日常工作',
    ]),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'single',
    content: '以下关于导师激励机制的描述，哪项是正确的？',
    options: JSON.stringify([
      '导师辅导实习生不计入激励范围',
      '只有校招新人的导师才有物质激励',
      '导师每辅导一位首次以正式员工身份入职的新员工，导师和新人各获得价值90元咖啡券',
      '导师激励仅以荣誉证书的形式体现',
    ]),
    answer: JSON.stringify(['C']),
  },
  {
    type: 'single',
    content: '新人正式入职前，导师可以做哪些准备？',
    options: JSON.stringify([
      '提前安排新人参与项目工作，尽快熟悉业务',
      '只能等新人入职当天再联系',
      '可提前与新人认识沟通，做好入职准备，但严禁提前安排工作任务',
      '发送正式任务清单，要求入职第一天即开始独立负责',
    ]),
    answer: JSON.stringify(['C']),
  },
  {
    type: 'single',
    content: '以下关于导师辅导周期阶段划分，正确的是？',
    options: JSON.stringify([
      '试用期全程只有一个阶段：上手成长期',
      '导师辅导分为破冰融入期和上手成长期两个阶段',
      '导师辅导分为三个阶段：破冰融入期、上手成长期、独立工作期',
      '辅导周期结束后导师与新人即无任何关联',
    ]),
    answer: JSON.stringify(['B']),
  },

  // ══════════════ 判断题 5道 ══════════════
  {
    type: 'truefalse',
    content: '秘书可以在未获得部门负责人授权的情况下，自主决定参与业务辅助工作（如重点项目跟进、商务活动支持）。',
    options: JSON.stringify(['正确', '错误']),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'truefalse',
    content: '根据导师手册，导师可以在新员工正式入职之前就安排其开始工作，以提前熟悉业务。',
    options: JSON.stringify(['正确', '错误']),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'truefalse',
    content: '导师可以将自己的系统账号借给新人使用，方便其查询工作所需数据。',
    options: JSON.stringify(['正确', '错误']),
    answer: JSON.stringify(['B']),
  },
  {
    type: 'truefalse',
    content: '公司没有远程办公政策，导师不可以私自安排员工或实习生在家远程办公。',
    options: JSON.stringify(['正确', '错误']),
    answer: JSON.stringify(['A']),
  },
  {
    type: 'truefalse',
    content: 'TEG秘书白皮书中，「业务辅助」模块属于秘书的基础必做工作，每位秘书均须提供。',
    options: JSON.stringify(['正确', '错误']),
    answer: JSON.stringify(['B']),
  },
]

async function main() {
  // 1. 删除旧的导师题（zone = 'mentor' 或 null）
  const d1 = await prisma.question.deleteMany({ where: { zone: 'mentor' } })
  const d2 = await prisma.question.deleteMany({ where: { zone: null } })
  console.log(`✅ 已删除旧题目 ${d1.count + d2.count} 道`)

  // 2. 批量插入新题
  const created = await prisma.question.createMany({
    data: questions.map(q => ({ ...q, zone: 'mentor' })),
  })
  console.log(`✅ 已导入新题目 ${created.count} 道`)

  // 3. 统计验证
  const counts = await prisma.question.groupBy({
    by: ['type'],
    where: { zone: 'mentor' },
    _count: true,
  })
  console.log('题型分布：', counts.map(c => `${c.type}×${c._count}`).join('、'))
}

main().catch(console.error).finally(() => prisma.$disconnect())
