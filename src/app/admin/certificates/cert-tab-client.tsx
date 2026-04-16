'use client'

import { useState } from 'react'

interface MentorCert {
  id: string
  name: string
  email: string
  certificateNo: string
  score: number
  issuedAt: string
  expiresAt: string
  expired: boolean
}

interface NewbieCert {
  id: string
  name: string
  email: string
  badgeNo: string
  score: number | null
  issuedAt: string
  subjectiveAnswer: string | null
}

export function CertTabClient({
  mentorData,
  mentorValidCount,
  newbieData,
}: {
  mentorData: MentorCert[]
  mentorValidCount: number
  newbieData: NewbieCert[]
}) {
  const [tab, setTab] = useState<'mentor' | 'newbie'>('mentor')
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      {/* 标签页切换 */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setTab('mentor')}
          className={`px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'mentor'
              ? 'text-amber-700 border-b-2 border-amber-500 bg-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🎓 导师专区
        </button>
        <button
          onClick={() => setTab('newbie')}
          className={`px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'newbie'
              ? 'text-blue-700 border-b-2 border-blue-500 bg-white'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🌱 新人专区
        </button>
      </div>

      {/* 导师认证证书 */}
      {tab === 'mentor' && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
            <div className="flex items-center gap-2">
              <span>🏆</span>
              <h2 className="font-bold text-amber-800 text-sm">导师认证证书</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">
                {mentorValidCount} 张有效
              </span>
              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                共 {mentorData.length} 张
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">导师</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">用户ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">证书编号</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">考试得分</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">颁发日期</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">有效期至</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mentorData.map((cert) => {
                  const wxId = cert.email.split('@')[0]
                  return (
                    <tr key={cert.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                            {cert.name?.[0] ?? '?'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{cert.name}</div>
                            <div className="text-xs text-amber-400 font-mono">{cert.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{wxId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{cert.certificateNo}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-lg font-black text-amber-500">{cert.score}</span>
                        <span className="text-xs text-gray-400 ml-1">分</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{cert.issuedAt}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-500">{cert.expiresAt}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          cert.expired ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cert.expired ? 'bg-red-400' : 'bg-green-500'}`} />
                          {cert.expired ? '已过期' : '有效'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {mentorData.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-sm">暂无导师认证证书</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 新人结业证书 */}
      {tab === 'newbie' && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
            <div className="flex items-center gap-2">
              <span>🌱</span>
              <h2 className="font-bold text-blue-800 text-sm">新人成长课程结业证书</h2>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              共 {newbieData.length} 张
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">新人</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">用户ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">证书编号</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">考试得分</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">颁发日期</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">主观题答案</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {newbieData.map((cert) => {
                  const wxId = cert.email.split('@')[0]
                  const isExp = expanded === cert.id
                  const hasAnswer = !!cert.subjectiveAnswer
                  return (
                    <tr key={cert.id} className="hover:bg-blue-50/30 transition-colors align-top">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                            {cert.name?.[0] ?? '?'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{cert.name}</div>
                            <div className="text-xs text-blue-400 font-mono">{cert.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{wxId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{cert.badgeNo}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {cert.score !== null ? (
                          <>
                            <span className="text-lg font-black text-blue-500">{cert.score}</span>
                            <span className="text-xs text-gray-400 ml-1">分</span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{cert.issuedAt}</td>
                      <td className="px-5 py-3.5 max-w-xs">
                        {hasAnswer ? (
                          <div>
                            <p className={`text-sm text-gray-700 leading-relaxed ${!isExp ? 'line-clamp-2' : ''}`}>
                              {cert.subjectiveAnswer}
                            </p>
                            {(cert.subjectiveAnswer?.length ?? 0) > 60 && (
                              <button
                                onClick={() => setExpanded(isExp ? null : cert.id)}
                                className="text-xs text-blue-500 hover:underline mt-0.5"
                              >
                                {isExp ? '收起' : '展开全文'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">未作答</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {newbieData.length === 0 && (
              <div className="text-center py-14 text-gray-400">
                <div className="text-4xl mb-3">🌱</div>
                <p className="text-sm">暂无新人结业证书</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
