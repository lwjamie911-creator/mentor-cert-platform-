# TEG 平台 UI 改造规范（暖棕温馨风）

所有页面改造必须严格遵循本规范，保证全站视觉统一。

## 核心色板（tailwind.config.ts 已定义，直接用类名）
- `ink` #17191c（几乎不用了，避免纯黑）
- `paper` #ffffff 画布
- `blush` #fbe1d1 蜜桃 / `sienna` #5d2a1a 赭石
- `line` #ececec 发丝边框
- **暖棕色阶 cocoa（主力）**：
  - `cocoa-900` #3d1f14 最深棕 → 主标题
  - `cocoa-800` #5d2a1a 深棕 → 主按钮底/正文强调
  - `cocoa-700` #7a4230 → 正文
  - `cocoa-600` #9a5c44 → 次级文字
  - `cocoa-500` #b87a5e → 辅助文字
  - `cocoa-400` #cf9c84 → 占位/描边
  - `cocoa-300` #e8c4ac 浅蜜桃棕 → 边框
  - `cocoa-200` #f5d9c4 蜜桃
  - `cocoa-100` #fbe6d6 浅蜜桃 → 次级背景
  - `cocoa-50` #fdf4ec 最浅暖纸底 → 页面背景

## 页面统一性原则（重要 —— 用户强调）
**同一个页签/模块内的所有元素必须共享同一主题色**，不能页签是玫瑰色、里面的按钮/输入框/边框/强调文字却是棕色——那样显得乱。具体：
- 每个页签有一个主题色（导师专区：资质自检-棕/学测-琥珀/师徒-玫瑰/成长守护-绿/班会-橙）。
- 该页签内的：主按钮底色、输入框 focus 边框/ring、强调文字/标题、卡片 ring/边框、图标底、状态徽标、进度条、可点链接色，**全部用该页签的主题色系**（如师徒结对整块用 rose：rose 按钮、rose focus、rose 图标底、rose 强调）。
- 中性文字（正文黑棕、辅助灰）、状态语义色（成功=emerald、危险=红）可保留，但"主题强调"部分要统一到页签色。
- 实现方式：定义主题对象（含 btn/input/ring/text/iconBg/badge 等类名），从页签容器一路传入内层业务组件，内层组件用传入的 accent 而非写死颜色。

## 配色原则（重要 —— 用户强调）
1. **模块用主色区分 + 底色也要区分**：
   - **新人专区**：主色 = 柔粉 `petal` 系；页面/大区底色 = **中性浅底**（`bg-fog` #fafafb 或 `bg-paper` 或极浅粉 `petal-50`）。**禁止**新人专区用 cocoa 棕做主色或 cocoa-50 棕底。粉色元素（页签选中、图标底、进度条、强调）浮在中性底上。
   - **导师专区**：主色 = 深棕 `cocoa` 系；页面/大区底色 = **中性浅底**（`bg-fog` 或 `bg-paper`）。**禁止**导师专区用 cocoa-50 棕底（棕主色配棕底会糊成一片）。
   - 两个专区主色（粉 vs 棕）冷暖深浅拉开，一眼可辨；底色都走中性，让主色跳出来。
2. **多色和谐点缀（必须体现，别全用主色）**：在主色之上，用少量柔和功能色做点缀，让画面丰富不发闷：
   - 完成/成功/已通过 → 柔绿 `emerald-50/600/700`
   - 提醒/强调/寄语 → 蜜桃 `blush` / `sienna`
   - 信息/进行中/徽标 → 暖黄 `amber-50/600`（浅调，别整片金）
   - 新人主题点缀 → `petal` 粉；导师主题点缀 → `cocoa` 棕
   - 多张并列卡片/图标底，用不同点缀色轮换（粉/绿/黄/桃），不要全同色。
3. **不要大面积同色块**：浅中性底(fog/paper) + 白卡片 + 小面积彩色点缀。相邻卡片/页签深浅或点缀色交替。深色 hero 用渐变非纯色。
4. **相邻模块色系拉开**：并列元素相邻两个不用几乎一样的色。
5. **和谐优先**：点缀色柔和低饱和带暖，避免刺眼正蓝/正绿/正红。

## 铁律
1. **不用纯黑**：文字一律用 cocoa 色阶（标题 cocoa-900，正文 cocoa-700，辅助 cocoa-500/600，占位 cocoa-400）。
2. **不用旧的蓝/靛/紫**（blue/indigo/violet/sky）和旧的琥珀(amber/orange)硬编码——全部换成 cocoa 暖棕系 + blush 蜜桃点缀。原新人蓝色主题、导师金色主题统一并入暖棕系。
3. **圆角**：按钮/输入/小元素 `rounded-lg`(8px)；卡片 `rounded-2xl`(=12px，已被覆盖)。**禁止** rounded-3xl 视觉上>12（已被覆盖为12，安全）。`rounded-full` 仅用于头像/圆点/加载圈/进度点这类真圆形。
4. **emoji → lucide-react 图标**：把 JSX 里的 emoji（🌱🎓📋✦🏅📢🕐📍💡🎯📚🤝 等）换成 lucide-react 图标组件（import { XXX } from 'lucide-react'），配 cocoa 色 + strokeWidth={2}，尺寸如 w-4 h-4 / w-5 h-5。装饰性 emoji 可直接删。保留在纯文本字符串/数据里的 emoji 不用动。
5. **背景**：页面底色用 `bg-cocoa-50` 或 `bg-paper`；卡片 `bg-paper` + `border border-line` + `shadow-card`。次级区块 `bg-cocoa-50/60`。
6. **按钮**：优先复用 `import { Button } from '@/components/ui/button'`（variant: primary深棕/ghost/accent蜜桃/subtle；有 hover 上浮+按下 scale 动效）。若不便替换则内联时也要加 `transition-all active:scale-[0.97] hover:-translate-y-0.5`。
7. **卡片容器**可复用 `import { Card, CardHeader, CardBody, Tag } from '@/components/ui/card'`。
8. **标题**用 `font-display`（衬线宋体）class 提升编辑感，配 cocoa-900。
9. **动效**：可用 `animate-fade-up`/`animate-fade-in`/`animate-scale-in`；光晕纹理用 `animate-drift-1/2/3`（配 blur-3xl 的径向渐变圆，opacity 0.3-0.6，暖色 #fbe1d1/#e8c4ac/#f5d9c4）。鼓励在页面级/hero 区多加光晕动态。
10. **渐变**：暖色渐变用 cocoa/blush 系，如 `linear-gradient(150deg,#fdf4ec,#fbe6d6,#f5d9c4)`。深色面（如需）用 `linear-gradient(135deg,#5d2a1a,#7a4230)` 深棕而非黑。

## 参考样板
已改好的 `src/app/login/login-form.tsx` 是标杆：左侧暖渐变+漂移光晕+网点纹理，右侧棕色文字表单。按同样气质改其它页。

## 交互动效要求
按钮、卡片可点区、页签等重点交互要有过渡：hover 微上浮/变色、active 轻微缩放。列表项/卡片入场可 fade-up。

## 注意
- 不要改动业务逻辑、数据查询、API 调用、props 结构——只改视觉（className、内联 style、图标、文案排版）。
- 保持 TypeScript 通过。lucide 图标记得 import。
- 打印页（certificate/badge 的 print-view）保持可打印，暖色改造从简，别破坏 @media print。
