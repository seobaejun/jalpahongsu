import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Firebase Admin SDK 초기화
const initializeFirebaseAdmin = () => {
  // 이미 초기화된 앱이 있으면 재사용
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // 서비스 계정 키 파일 경로
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (serviceAccountPath) {
    // 서비스 계정 키 파일 사용
    return initializeApp({
      credential: cert(serviceAccountPath),
      projectId: 'hongsu-9d9c2',
      storageBucket: 'hongsu-9d9c2.firebasestorage.app'
    });
  } else {
    // 로컬 개발 환경에서는 기본 자격 증명 사용
    return initializeApp({
      projectId: 'hongsu-9d9c2',
      storageBucket: 'hongsu-9d9c2.firebasestorage.app'
    });
  }
};

// Firebase Admin 앱 초기화
const adminApp = initializeFirebaseAdmin();

// Firebase Admin 서비스들 내보내기
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

export default adminApp;
