'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // 이미 로그인된 경우 리다이렉트
  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      setLoading(false);
      return;
    }

    // 비밀번호 길이 확인
    if (formData.password.length < 6) {
      setError(t('auth.register.passwordLength'));
      setLoading(false);
      return;
    }

    const result = await signUp(
      formData.email, 
      formData.password, 
      formData.displayName
    );
    
    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || '회원가입에 실패했습니다.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.register.hasAccount')}{' '}
            <Link href="/login" className="font-medium text-red-600 hover:text-red-500">
              {t('auth.register.login')}
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* 이름 */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                {t('auth.register.name')} *
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder={t('auth.register.name')}
                value={formData.displayName}
                onChange={handleChange}
              />
            </div>

            {/* 이메일 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t('auth.login.email')} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder={t('auth.login.email')}
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('auth.login.password')} *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder={t('auth.login.password')}
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('auth.register.confirmPassword')} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder={t('auth.register.confirmPassword')}
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.register.loading') : t('auth.register.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
