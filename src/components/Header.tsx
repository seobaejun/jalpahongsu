'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { logout } from '@/lib/auth'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, userProfile, isAuthenticated, loading } = useAuth()
  const { isAdmin, userRole, adminLoading } = useAdminAuth()
  const { t } = useLanguage()

  // 디버깅을 위한 로그
  console.log('Header - isAuthenticated:', isAuthenticated)
  console.log('Header - isAdmin:', isAdmin)
  console.log('Header - userRole:', userRole)
  console.log('Header - adminLoading:', adminLoading)

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 모바일 언어 버튼 */}
            <div className="flex-shrink-0 flex items-center space-x-2">
              <Link href="/" className="text-lg md:text-2xl font-bold text-red-600">
                {t('site.title')}
              </Link>
              {/* 모바일 언어 전환 */}
              <div className="md:hidden">
                <LanguageSwitcher />
              </div>
            </div>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                {t('nav.home')}
              </Link>
              <Link href="/instagram" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                {t('nav.instagram')}
              </Link>
              {(!adminLoading && isAdmin) || (isAuthenticated && user?.email === 'sprince1004@naver.com') ? (
                <Link href="/admin" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                  {t('nav.admin')}
                </Link>
              ) : null}
              {isAuthenticated && (
                <Link href="/mypage" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                  {t('nav.mypage')}
                </Link>
              )}
            </nav>

          {/* 로그인/회원가입 또는 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {/* 언어 전환 버튼 */}
            <LanguageSwitcher />
            
              {loading ? (
                <div className="text-gray-500">{t('nav.loading')}</div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">
                    {t('nav.welcome')}, {userProfile?.displayName || user?.displayName || t('nav.user')}{t('nav.honorific') ? t('nav.honorific') : ''}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium">
                  {t('nav.login')}
                </Link>
                <Link href="/register" className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none focus:text-red-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

          {/* 모바일 메뉴 */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 sm:px-3 bg-white border-t">
                <div className={`grid gap-2 ${(!adminLoading && isAdmin) || (isAuthenticated && user?.email === 'sprince1004@naver.com') ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  <Link href="/" className="text-gray-700 hover:text-white px-2 py-2 text-xs font-medium text-center border border-pink-200 rounded bg-pink-50 hover:bg-pink-200 transition-colors">
                    {t('nav.home')}
                  </Link>
                  <Link href="/instagram" className="text-gray-700 hover:text-white px-2 py-2 text-xs font-medium text-center border border-purple-200 rounded bg-purple-50 hover:bg-purple-200 transition-colors">
                    {t('nav.instagram')}
                  </Link>
                  {(!adminLoading && isAdmin) || (isAuthenticated && user?.email === 'sprince1004@naver.com') ? (
                    <Link href="/admin" className="text-gray-700 hover:text-white px-2 py-2 text-xs font-medium text-center border border-blue-200 rounded bg-blue-50 hover:bg-blue-200 transition-colors">
                      {t('nav.admin')}
                    </Link>
                  ) : null}
                  {isAuthenticated && (
                    <Link href="/mypage" className="text-gray-700 hover:text-white px-2 py-2 text-xs font-medium text-center border border-green-200 rounded bg-green-50 hover:bg-green-200 transition-colors">
                      {t('nav.mypage')}
                    </Link>
                  )}
                </div>
              <div className="border-t pt-4 mt-2">
                  {loading ? (
                    <div className="text-gray-500 px-3 py-2">{t('nav.loading')}</div>
                  ) : isAuthenticated ? (
                    <>
                      <div className="text-gray-700 px-3 py-2 text-base">
                        {t('nav.welcome')}, {userProfile?.displayName || user?.displayName || t('nav.user')}{t('nav.honorific') ? t('nav.honorific') : ''}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="block text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium w-full text-left"
                      >
                        {t('nav.logout')}
                      </button>
                    </>
                  ) : (
                  <>
                    <Link href="/login" className="block text-gray-700 hover:text-red-600 px-3 py-2 text-base font-medium">
                      {t('nav.login')}
                    </Link>
                    <Link href="/register" className="block bg-red-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-red-700 mt-2">
                      {t('nav.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
