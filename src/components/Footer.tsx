'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import TermsModal from './TermsModal'
import { TERMS_CONTENT, PRIVACY_CONTENT } from '@/lib/terms'

export default function Footer() {
  const { t } = useLanguage()
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 로고 및 설명 */}
          <div>
            <h3 className="text-2xl font-bold text-gray-200 mb-4">
              {t('site.title')}
            </h3>
            <p className="text-gray-300 mb-4 max-w-md">
              {t('site.description')}
            </p>
          </div>

          {/* 정책 및 약관 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">정책 및 약관</h4>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsTermsModalOpen(true)}
                className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer"
              >
                이용약관
              </button>
              <button 
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer"
              >
                개인정보처리방침
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex justify-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
      
      {/* 이용약관 모달 */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        title="이용약관"
        content={TERMS_CONTENT}
      />

      {/* 개인정보처리방침 모달 */}
      <TermsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        title="개인정보처리방침"
        content={PRIVACY_CONTENT}
      />
    </footer>
  )
}
