'use client'

import { useState } from 'react'
// import { useRouter } from 'next/navigation' // 사용하지 않음
import Link from 'next/link'
// import { useLanguage } from '@/contexts/LanguageContext' // 사용하지 않음
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  // const router = useRouter() // 사용하지 않음
  // const { t } = useLanguage() // 사용하지 않음

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await sendPasswordResetEmail(auth, email)
      setMessage('비밀번호 재설정 이메일이 전송되었습니다. 이메일을 확인해주세요.')
    } catch (error: unknown) {
      console.error('비밀번호 재설정 오류:', error)
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined;
      switch (errorCode) {
        case 'auth/user-not-found':
          setError('해당 이메일로 등록된 계정이 없습니다.')
          break
        case 'auth/invalid-email':
          setError('올바른 이메일 주소를 입력해주세요.')
          break
        case 'auth/too-many-requests':
          setError('너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.')
          break
        default:
          setError('비밀번호 재설정 중 오류가 발생했습니다. 다시 시도해주세요.')
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            비밀번호 찾기
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일 주소
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="이메일 주소를 입력하세요"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '전송 중...' : '비밀번호 재설정 이메일 보내기'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-red-600 hover:text-red-500">
              로그인 페이지로 돌아가기
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
