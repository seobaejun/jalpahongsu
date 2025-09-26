'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    if (language === 'zh') {
      setLanguage('ko')
    } else if (language === 'ko') {
      setLanguage('en')
    } else {
      setLanguage('zh')
    }
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
      title={language === 'zh' ? 'Switch to Korean' : language === 'ko' ? 'Switch to English' : 'Switch to Chinese'}
    >
      <span className={`${language === 'zh' ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
        中文
      </span>
      <span className="text-gray-300">/</span>
      <span className={`${language === 'ko' ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
        한국어
      </span>
      <span className="text-gray-300">/</span>
      <span className={`${language === 'en' ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
        English
      </span>
    </button>
  )
}
