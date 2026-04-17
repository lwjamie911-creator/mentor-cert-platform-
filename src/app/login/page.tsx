import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'TEG秘书成长平台',
  description: '让每一段成长，都有迹可循 · 导师认证、新人成长课程、导师新人配对',
  openGraph: {
    title: 'TEG秘书成长平台',
    description: '让每一段成长，都有迹可循 · 导师认证、新人成长课程、导师新人配对',
    siteName: 'TEG秘书成长平台',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TEG秘书成长平台',
    description: '让每一段成长，都有迹可循 · 导师认证、新人成长课程、导师新人配对',
    images: ['/opengraph-image'],
  },
}

export default function LoginPage() {
  return <LoginForm />
}
