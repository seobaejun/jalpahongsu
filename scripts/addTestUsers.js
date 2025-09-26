// 테스트 사용자들을 Firestore에 추가하는 스크립트
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

// 테스트 사용자 데이터
const testUsers = [
  {
    uid: 'test-user-1',
    email: 'test1@example.com',
    displayName: '김철수',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  },
  {
    uid: 'test-user-2', 
    email: 'test2@example.com',
    displayName: '이영희',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date()
  },
  {
    uid: 'test-user-3',
    email: 'test3@example.com', 
    displayName: '박민수',
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date()
  },
  {
    uid: 'test-user-4',
    email: 'test4@example.com',
    displayName: '최지영',
    createdAt: new Date(), // 오늘 가입
    updatedAt: new Date()
  },
  {
    uid: 'test-user-5',
    email: 'test5@example.com',
    displayName: '정수진',
    createdAt: new Date(), // 오늘 가입
    updatedAt: new Date()
  }
];

// 테스트 사용자들 추가 함수
async function addTestUsers() {
  try {
    console.log('테스트 사용자들 추가 시작...');
    console.log(`총 ${testUsers.length}명의 사용자를 추가합니다.`);
    
    const usersRef = collection(db, 'users');
    
    for (const user of testUsers) {
      await addDoc(usersRef, user);
      console.log(`✅ 추가 완료: ${user.displayName} (${user.email})`);
    }
    
    console.log('🎉 모든 테스트 사용자가 성공적으로 추가되었습니다!');
    console.log(`📊 총 ${testUsers.length}명의 사용자가 추가되었습니다.`);
    
  } catch (error) {
    console.error('❌ 사용자 추가 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  addTestUsers()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { addTestUsers };
