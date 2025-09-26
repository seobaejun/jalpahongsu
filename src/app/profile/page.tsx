'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProfilePage() {
  const { user, userProfile, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    displayName: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || ''
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdateLoading(true);
    setMessage('');

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        updatedAt: new Date()
      });

      setMessage(t('profile.success'));
      setIsEditing(false);
    } catch {
      setMessage(t('profile.error'));
    }

    setUpdateLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.title')}</h1>
            
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    {t('auth.register.name')}
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    id="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t('profile.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {t('profile.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {updateLoading ? t('profile.saving') : t('profile.save')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700"
                  >
                    {t('profile.edit')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
