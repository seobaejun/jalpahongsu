import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// 사용자 타입 정의
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role?: 'admin' | 'advertiser' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// 회원가입 함수
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    // Firebase Auth로 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 사용자 프로필 업데이트
    await updateProfile(user, {
      displayName: displayName
    });

      // Firestore에 사용자 정보 저장
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName,
        role: 'user', // 기본 역할은 일반 사용자
        createdAt: new Date(),
        updatedAt: new Date()
      };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return { success: true, user };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, error: errorMessage };
  }
};

// 로그인 함수
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, error: errorMessage };
  }
};

// 로그아웃 함수
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    return { success: false, error: errorMessage };
  }
};

// 사용자 프로필 가져오기
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    console.log('getUserProfile 호출됨, uid:', uid)
    const userDoc = await getDoc(doc(db, 'users', uid));
    console.log('사용자 문서 존재 여부:', userDoc.exists())
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserProfile;
      console.log('사용자 프로필 데이터:', userData)
      return userData;
    } else {
      console.warn('사용자 문서가 존재하지 않습니다. uid:', uid)
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// 인증 상태 변경 감지
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
