// 기존 사용자를 Firestore에 추가하는 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBozZHNiZa7m_MznFzzcj-xRxf2J7bjeOo",
  authDomain: "hongsu-9d9c2.firebaseapp.com",
  projectId: "hongsu-9d9c2",
  storageBucket: "hongsu-9d9c2.firebasestorage.app",
  messagingSenderId: "102045054206",
  appId: "1:102045054206:web:1f060f9e06af0b7e6fe1af",
  measurementId: "G-2SDG086GFP"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 기존 사용자 데이터
const existingUser = {
  uid: 'existing-user-sprince1004',
  email: 'sprince1004@naver.com',
  displayName: 'sprince1004',
  createdAt: new Date('2024-01-01'), // 과거 날짜로 설정
  updatedAt: new Date()
};

// 사용자 추가 함수
async function addExistingUser() {
  try {
    console.log('기존 사용자 추가 시작...');
    console.log('사용자 정보:', existingUser);
    
    const usersRef = collection(db, 'users');
    await addDoc(usersRef, existingUser);
    
    console.log('✅ 기존 사용자가 성공적으로 추가되었습니다!');
    console.log(`📧 이메일: ${existingUser.email}`);
    console.log(`👤 이름: ${existingUser.displayName}`);
    console.log(`📅 가입일: ${existingUser.createdAt.toLocaleDateString('ko-KR')}`);
    
  } catch (error) {
    console.error('❌ 사용자 추가 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  addExistingUser()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { addExistingUser };
