import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import { UserImporter } from './user-importer'
import { Upload, Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'learner' },
    orderBy: { createdAt: 'desc' },
    include: {
      certificates: { select: { id: true } },
    },
  })

  const activeCount = users.filter(u => u.status === 'active').length

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-cocoa-900">用户管理</h1>
          <p className="text-sm text-cocoa-500 mt-1">
            共 <span className="text-cocoa-800 font-medium">{users.length}</span> 名学员 ·{' '}
            <span className="text-green-600 font-medium">{activeCount}</span> 名正常
          </p>
        </div>
      </div>

      {/* 批量导入 */}
      <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-line/70 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}>
          <Upload className="w-4 h-4 text-cocoa-800" strokeWidth={2} />
          <h2 className="font-semibold text-cocoa-900 text-sm">批量导入学员</h2>
        </div>
        <div className="p-5">
          <UserImporter />
        </div>
      </section>

      {/* 用户列表 */}
      <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-line/70 flex items-center justify-between">
          <h2 className="font-semibold text-cocoa-900 text-sm">学员列表</h2>
          <span className="text-xs text-cocoa-500 bg-cocoa-50 px-2.5 py-1 rounded-full">{users.length} 人</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-cocoa-50 border-b border-line">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">姓名</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">邮箱 / 企微ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">状态</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">证书</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">上次登入时间</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/70">
              {users.map((user) => {
                const wxId = user.email.split('@')[0]
                return (
                  <tr key={user.id} className="hover:bg-cocoa-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cocoa-100 flex items-center justify-center text-cocoa-700 font-bold text-xs flex-shrink-0">
                          {user.name?.[0] ?? '?'}
                        </div>
                        <span className="font-medium text-cocoa-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-cocoa-600 text-xs">{user.email}</div>
                      <div className="text-xs text-cocoa-400 font-mono mt-0.5">{wxId}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'   ? 'bg-green-50 text-green-700' :
                        user.status === 'disabled' ? 'bg-red-50 text-red-600' :
                        'bg-cocoa-100 text-cocoa-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-green-500' :
                          user.status === 'disabled' ? 'bg-red-500' : 'bg-cocoa-400'
                        }`} />
                        {user.status === 'active' ? '正常' : user.status === 'disabled' ? '禁用' : '待激活'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.certificates.length > 0
                        ? <span className="text-cocoa-700 font-medium">{user.certificates.length} 张</span>
                        : <span className="text-cocoa-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-cocoa-500">
                      {user.lastLoginAt ? dayjs(user.lastLoginAt).format('YYYY-MM-DD HH:mm') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <UserStatusToggle userId={user.id} status={user.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-16 text-cocoa-400">
              <Users className="w-10 h-10 mx-auto mb-3 text-cocoa-300" strokeWidth={1.5} />
              <p className="text-sm">暂无学员，通过上方导入功能添加</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function UserStatusToggle({ userId, status }: { userId: string; status: string }) {
  return (
    <form action={`/api/admin/users/${userId}/toggle`} method="POST">
      <button type="submit"
        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all active:scale-[0.97] ${
          status === 'active'
            ? 'border-red-200 text-red-500 hover:bg-red-50'
            : 'border-green-200 text-green-600 hover:bg-green-50'
        }`}
      >
        {status === 'active' ? '禁用' : '启用'}
      </button>
    </form>
  )
}
