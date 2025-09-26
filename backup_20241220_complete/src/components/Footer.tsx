'use client'

import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 설명 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-red-400 mb-4">
              {t('site.title')}
            </h3>
            <p className="text-gray-300 mb-4 max-w-md">
              {t('site.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">微信</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.5 2C5.5 2 3 4.5 3 7.5c0 1.5.5 2.8 1.4 3.9L2 18l6.6-2.4c1.1.4 2.3.6 3.5.6 3 0 5.5-2.5 5.5-5.5S14.5 2 11.5 2z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">微博</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/experiences" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.experiences')}
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.reviews')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.help')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            <p className="text-gray-400 text-sm mt-2 md:mt-0">
              {t('footer.service')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
