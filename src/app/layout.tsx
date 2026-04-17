import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TEG秘书成长平台',
  description: '让每一段成长，都有迹可循 · 导师认证、新人成长课程、导师新人配对一体化平台',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
