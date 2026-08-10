import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 校验是否为腾讯文档链接（doc.weixin.qq.com）
export function isTencentDocUrl(url: string): boolean {
  return /^https:\/\/doc\.weixin\.qq\.com\//.test(url.trim())
}
