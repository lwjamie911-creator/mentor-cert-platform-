'use client'

import { useState } from 'react'
import { GraduationCap, Sprout, Award } from 'lucide-react'

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
      <div className="flex gap-2 border-b border-line pb-0">
        <button
          onClick={() => setTab('mentor')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'mentor'
              ? 'text-cocoa-800 border-b-2 border-cocoa-700 bg-paper'
              : 'text-cocoa-400 hover:text-cocoa-600'
          }`}
        >
          <GraduationCap className="w-4 h-4" strokeWidth={2} /> 导师专区
        </button>
        <button
          onClick={() => setTab('newbie')}
          className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors -mb-px ${
            tab === 'newbie'
              ? 'text-petal-800 border-b-2 border-petal-600 bg-paper'
              : 'text-cocoa-400 hover:text-cocoa-600'
          }`}
        >
          <Sprout className="w-4 h-4" strokeWidth={2} /> 新人专区
        </button>
      </div>

      {/* 导师认证证书 */}
      {tab === 'mentor' && (
        <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-line/70 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #fdf4ec, #fbe6d6)' }}>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cocoa-800" strokeWidth={2} />
              <h2 className="font-semibold text-cocoa-900 text-sm">导师认证证书</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                {mentorValidCount} 张有效
              </span>
              <span className="text-xs bg-cocoa-100 text-cocoa-700 px-2.5 py-1 rounded-full font-medium">
                共 {mentorData.length} 张
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead className="bg-cocoa-50 border-b border-line">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">导师</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">用户ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">证书编号</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">考试得分</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">颁发日期</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">有效期至</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-cocoa-500 uppercase tracking-wide">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {mentorData.map((cert) => {
                  const wxId = cert.email.split('@')[0]
                  return (
                    <tr key={cert.id} className="hover:bg-cocoa-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-cocoa-100 flex items-center justify-center text-cocoa-800 font-bold text-xs flex-shrink-0">
                            {cert.name?.[0] ?? '?'}
                          </div>
                          <div>
                            <div className="font-medium text-cocoa-900">{cert.name}</div>
                            <div className="text-xs text-cocoa-400 font-mono">{cert.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-cocoa-500 bg-cocoa-50 px-2 py-1 rounded-lg">{wxId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-cocoa-500 bg-cocoa-50 px-2 py-1 rounded-lg">{cert.certificateNo}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-lg font-black text-cocoa-700">{cert.score}</span>
                        <span className="text-xs text-cocoa-400 ml-1">分</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-cocoa-500">{cert.issuedAt}</td>
                      <td className="px-5 py-3.5 text-sm text-cocoa-500">{cert.expiresAt}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          cert.expired ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cert.expired ? 'bg-red-400' : 'bg-emerald-500'}`} />
                          {cert.expired ? '已过期' : '有效'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {mentorData.length === 0 && (
              <div className="text-center py-14 text-cocoa-400">
                <Award className="w-10 h-10 mx-auto mb-3 text-cocoa-300" strokeWidth={1.5} />
                <p className="text-sm">暂无导师认证证书</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 新人结业证书 */}
      {tab === 'newbie' && (
        <section className="bg-paper rounded-2xl border border-line shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-line/70 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #fef6f7, #fce4e6)' }}>
            <div className="flex items-center gap-2">
              <Sprout className="w-5 h-5 text-petal-700" strokeWidth={2} />
              <h2 className="font-semibold text-petal-900 text-sm">新人成长课程结业证书</h2>
            </div>
            <span className="text-xs bg-petal-100 text-petal-800 px-2.5 py-1 rounded-full font-medium">
              共 {newbieData.length} 张
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-petal-50 border-b border-line">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-petal-700/70 uppercase tracking-wide">新人</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-petal-700/70 uppercase tracking-wide">用户ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-petal-700/70 uppercase tracking-wide">证书编号</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-petal-700/70 uppercase tracking-wide">考试得分</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-petal-700/70 uppercase tracking-wide">颁发日期</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-petal-700/70 uppercase tracking-wide">主观题答案</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {newbieData.map((cert) => {
                  const wxId = cert.email.split('@')[0]
                  const isExp = expanded === cert.id
                  const hasAnswer = !!cert.subjectiveAnswer
                  return (
                    <tr key={cert.id} className="hover:bg-petal-50/60 transition-colors align-top">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-petal-100 flex items-center justify-center text-petal-800 font-bold text-xs flex-shrink-0">
                            {cert.name?.[0] ?? '?'}
                          </div>
                          <div>
                            <div className="font-medium text-cocoa-900">{cert.name}</div>
                            <div className="text-xs text-petal-500 font-mono">{cert.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-cocoa-500 bg-cocoa-50 px-2 py-1 rounded-lg">{wxId}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-cocoa-500 bg-cocoa-50 px-2 py-1 rounded-lg">{cert.badgeNo}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        {cert.score !== null ? (
                          <>
                            <span className="text-lg font-black text-petal-600">{cert.score}</span>
                            <span className="text-xs text-cocoa-400 ml-1">分</span>
                          </>
                        ) : (
                          <span className="text-xs text-cocoa-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-cocoa-500 whitespace-nowrap">{cert.issuedAt}</td>
                      <td className="px-5 py-3.5 max-w-xs">
                        {hasAnswer ? (
                          <div>
                            <p className={`text-sm text-cocoa-700 leading-relaxed ${!isExp ? 'line-clamp-2' : ''}`}>
                              {cert.subjectiveAnswer}
                            </p>
                            {(cert.subjectiveAnswer?.length ?? 0) > 60 && (
                              <button
                                onClick={() => setExpanded(isExp ? null : cert.id)}
                                className="text-xs text-petal-600 hover:underline mt-0.5"
                              >
                                {isExp ? '收起' : '展开全文'}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-cocoa-300">未作答</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {newbieData.length === 0 && (
              <div className="text-center py-14 text-cocoa-400">
                <Sprout className="w-10 h-10 mx-auto mb-3 text-petal-300" strokeWidth={1.5} />
                <p className="text-sm">暂无新人结业证书</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  )
}
