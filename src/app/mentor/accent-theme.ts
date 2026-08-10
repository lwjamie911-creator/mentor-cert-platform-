// 页签主题 —— 保证同一页签内所有元素配色统一（用户强调的页面统一性）
export interface AccentTheme {
  bar: string          // 选中态左色条渐变（from-x to-y）
  iconActive: string   // 选中态图标底 bg+text
  iconIdle: string     // 未选中图标底 bg+text
  titleActive: string  // 选中态标题色
  ring: string         // 卡片 ring
  shellIcon: string    // 内容区标题图标底 bg+text
  badge: string        // 徽标底 bg+text
  btn: string          // 主按钮 底+字+hover
  text: string         // 强调文字色
  softBg: string       // 浅色区块底
  softBorder: string   // 浅色区块边框
  iconChip: string     // 小图标底座 bg+text
  inputFocus: string   // 输入框 focus 边框+ring
}
