// 사용자 역할을 확인하는 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

// 사용자 역할 확인
async function checkUserRoles() {
  try {
    console.log('사용자 역할 확인 시작...');
    
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    console.log(`총 ${snapshot.size}명의 사용자:`);
    
    snapshot.docs.forEach((doc) => {
      const userData = doc.data();
      console.log(`- ${userData.email}: ${userData.role || '역할 없음'}`);
    });
    
  } catch (error) {
    console.error('❌ 사용자 역할 확인 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkUserRoles()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { checkUserRoles };
