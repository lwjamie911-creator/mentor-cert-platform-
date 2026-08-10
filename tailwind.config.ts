import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── 设计令牌（墨黑 + 蜂蜜桃 近单色体系，参考 DESIGN.md）──
        ink:    '#17191c', // 主文字 / 主按钮底 / 深色面
        paper:  '#ffffff', // 画布
        mist:   '#f2f2f3', // 卡片 / 次级背景
        fog:    '#fafafb', // 分区交替背景
        slate:  '#777b86', // 链接 / 辅助文字
        ash:    '#979799', // 三级标签
        smoke:  '#a3a6af', // 占位符
        blush:  '#fbe1d1', // 蜜桃点缀（唯一暖色面）
        sienna: '#5d2a1a', // 蜜桃面上的文字/描边
        line:   '#ececec', // 发丝边框
        // ── 暖棕色阶（导师专区主色 / 全站深色文字基调）──
        cocoa: {
          900: '#3d1f14', // 最深棕（主标题）
          800: '#5d2a1a', // 深棕（= sienna，正文强调）
          700: '#7a4230', // 中深棕（正文）
          600: '#9a5c44', // 中棕（次级文字）
          500: '#b87a5e', // 浅棕（辅助文字）
          400: '#cf9c84', // 更浅棕（占位/描边）
          300: '#e8c4ac', // 浅蜜桃棕
          200: '#f5d9c4', // 蜜桃
          100: '#fbe6d6', // 浅蜜桃
          50:  '#fdf4ec', // 最浅暖纸底
        },
        // ── 柔粉蜜桃色阶（新人专区主色，与 cocoa 拉开冷暖）──
        petal: {
          900: '#7a2f3a', // 深玫瑰（新人主标题强调）
          800: '#9d4552', // 深粉棕
          700: '#c05e6d', // 玫瑰粉（正文强调）
          600: '#d67d8a', // 中粉
          500: '#e59aa4', // 浅玫瑰
          400: '#f0b8bf', // 柔粉
          300: '#f8d3d7', // 浅柔粉
          200: '#fce4e6', // 淡粉
          100: '#fdeef0', // 极浅粉
          50:  '#fef6f7', // 最浅粉纸底
        },
        // 兼容旧代码引用（逐步替换；映射到新体系近似值，避免旧页面报错）
        brand: {
          50:  '#fafafb',
          100: '#f2f2f3',
          500: '#17191c',
          600: '#17191c',
          700: '#17191c',
          900: '#17191c',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Noto Serif SC', 'Source Serif 4', 'ui-serif', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // 约束：按键 ≤8px（rounded-lg），卡片 12px（rounded-2xl/3xl 收敛到 12）
        // rounded-full 保留给头像/圆点/加载圈等真正的圆形元素
        xl:    '8px',   // 覆盖 tailwind 默认 12px
        '2xl': '12px',  // 覆盖默认 16px → 卡片最大圆角
        '3xl': '12px',  // 覆盖默认 24px → 收敛到 12
      },
      boxShadow: {
        subtle: '0 0 0 1px rgba(4,23,43,0.05), 0 4px 24px 0 rgba(0,0,0,0.06)',
        card:   '0 0 0 1px rgba(4,23,43,0.04), 0 1px 2px 0 rgba(0,0,0,0.04)',
        float:  '0 0 0 1px rgba(4,23,43,0.05), 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.10)',
        pop:    '0 0 0 1px rgba(4,23,43,0.05), 0 4px 24px 0 rgba(0,0,0,0.08)',
      },
      letterSpacing: {
        tightest: '-0.025em',
        tighter:  '-0.015em',
      },
      keyframes: {
        'fade-in':  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'fade-up':  { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.97)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        // 温馨背景：缓慢漂移的暖色光晕
        'drift-1': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%':      { transform: 'translate(6%, 8%) scale(1.12)' },
        },
        'drift-2': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1.05)' },
          '50%':      { transform: 'translate(-8%, -6%) scale(1)' },
        },
        'drift-3': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%':      { transform: 'translate(5%, -7%) scale(1.1)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.3s ease-out',
        'fade-up':  'fade-up 0.4s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'drift-1':  'drift-1 18s ease-in-out infinite',
        'drift-2':  'drift-2 22s ease-in-out infinite',
        'drift-3':  'drift-3 26s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
