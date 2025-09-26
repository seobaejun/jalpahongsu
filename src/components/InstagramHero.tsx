'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function InstagramHero() {
  const { t } = useLanguage()
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  return (
    <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('instagram.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-pink-100">
            {t('instagram.subtitle')}
          </p>
          <p className="text-lg mb-12 text-pink-200 max-w-3xl mx-auto">
            {t('instagram.description')}
          </p>
          
            <div className="flex justify-center">
              <button 
                onClick={() => {
                  if (!loading && !isAuthenticated) {
                    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
                    router.push('/login')
                    return
                  }
                  
                  if (loading) {
                    // 로딩 중인 경우 아무것도 하지 않음
                    return
                  }
                  
                  // 로그인된 경우 체험단 섹션으로 스크롤
                  const experiencesSection = document.getElementById('experiences-section');
                  if (experiencesSection) {
                    experiencesSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-white text-pink-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {t('hero.cta1')}
              </button>
            </div>
        </div>
      </div>
    </section>
  )
}
