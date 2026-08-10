'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cocoa-500 hover:text-sienna hover:bg-blush/50 transition-colors active:scale-[0.97]"
    >
      <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
      退出
    </button>
  )
}
