// 체험단 태그 데이터를 확인하는 스크립트
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

// 체험단 태그 데이터 확인
async function checkTags() {
  try {
    console.log('체험단 태그 데이터 확인 시작...');
    
    const experiencesRef = collection(db, 'experiences');
    const snapshot = await getDocs(experiencesRef);
    
    console.log(`총 ${snapshot.size}개의 체험단:`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ${data.title}`);
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - 카테고리: ${data.category || '없음'}`);
      console.log(`   - 활동타입: ${data.activityType || '없음'}`);
      console.log(`   - 태그: ${data.tags ? JSON.stringify(data.tags) : '없음'}`);
      console.log(`   - 태그(중국어): ${data.tagsZh ? JSON.stringify(data.tagsZh) : '없음'}`);
      console.log(`   - 태그(영어): ${data.tagsEn ? JSON.stringify(data.tagsEn) : '없음'}`);
    });
    
  } catch (error) {
    console.error('❌ 체험단 태그 데이터 확인 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkTags().then(() => {
    console.log('✅ 스크립트 실행 완료');
    process.exit(0);
  }).catch(error => {
    console.error('❌ 스크립트 실행 오류:', error);
    process.exit(1);
  });
}

module.exports = { checkTags };
