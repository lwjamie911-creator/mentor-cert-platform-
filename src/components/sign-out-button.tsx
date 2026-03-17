'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="px-3 py-1.5 rounded-xl text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
    >
      退出
    </button>
  )
}
