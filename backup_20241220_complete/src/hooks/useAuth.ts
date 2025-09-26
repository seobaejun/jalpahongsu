'use client'

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getUserProfile, UserProfile } from '@/lib/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      console.log('=== useAuth: 인증 상태 변경 ===')
      console.log('사용자 정보:', user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : 'null')
      
      setUser(user);
      
      if (user) {
        // 사용자 프로필 정보 가져오기
        console.log('사용자 프로필 로딩 시작...')
        const profile = await getUserProfile(user.uid);
        console.log('사용자 프로필 로딩 결과:', profile)
        setUserProfile(profile);
      } else {
        console.log('사용자가 로그아웃됨')
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user
  };
};
