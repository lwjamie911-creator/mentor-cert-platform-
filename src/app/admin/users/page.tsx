import { prisma } from '@/lib/prisma'
import dayjs from 'dayjs'
import { UserImporter } from './user-importer'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: 'learner' },
    orderBy: { createdAt: 'desc' },
    include: {
      enrollments: { select: { status: true } },
      certificates: { select: { id: true } },
    },
  })

  const activeCount = users.filter(u => u.status === 'active').length

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-sm text-gray-400 mt-1">
            共 <span className="text-gray-700 font-medium">{users.length}</span> 名学员 ·{' '}
            <span className="text-green-600 font-medium">{activeCount}</span> 名正常
          </p>
        </div>
      </div>

      {/* 批量导入 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #f8f7ff, #ede9fe)' }}>
          <span>📥</span>
          <h2 className="font-bold text-indigo-800 text-sm">批量导入学员</h2>
        </div>
        <div className="p-5">
          <UserImporter />
        </div>
      </section>

      {/* 用户列表 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">学员列表</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{users.length} 人</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">姓名</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">邮箱 / 企微ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">状态</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">课程报名/完成</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">证书</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">注册时间</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const completed = user.enrollments.filter((e) => e.status === 'completed').length
                const wxId = user.email.split('@')[0]
                return (
                  <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          {user.name?.[0] ?? '?'}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-gray-600 text-xs">{user.email}</div>
                      <div className="text-xs text-indigo-400 font-mono mt-0.5">{wxId}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active'   ? 'bg-green-50 text-green-700' :
                        user.status === 'disabled' ? 'bg-red-50 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          user.status === 'active' ? 'bg-green-500' :
                          user.status === 'disabled' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        {user.status === 'active' ? '正常' : user.status === 'disabled' ? '禁用' : '待激活'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      <span className="font-medium text-gray-700">{user.enrollments.length}</span>
                      <span className="text-gray-300 mx-1">/</span>
                      <span className="text-green-600 font-medium">{completed}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {user.certificates.length > 0
                        ? <span className="text-amber-600 font-medium">{user.certificates.length} 张</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-400">
                      {dayjs(user.createdAt).format('YYYY-MM-DD')}
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
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">👥</div>
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
        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
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
