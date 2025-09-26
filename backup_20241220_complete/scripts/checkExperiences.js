// 체험단 데이터를 확인하는 스크립트
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

// 체험단 데이터 확인
async function checkExperiences() {
  try {
    console.log('체험단 데이터 확인 시작...');
    
    const experiencesRef = collection(db, 'experiences');
    const snapshot = await getDocs(experiencesRef);
    
    console.log(`총 ${snapshot.size}개의 체험단:`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. ${data.title}`);
      console.log(`   - ID: ${doc.id}`);
      console.log(`   - 상태: ${data.status}`);
      console.log(`   - 혜택: ${data.benefits ? data.benefits.length + '개' : '없음'}`);
      console.log(`   - 조건: ${data.requirements ? data.requirements.length + '개' : '없음'}`);
      console.log(`   - 장소: ${data.location || '없음'}`);
      console.log(`   - 날짜: ${data.date || '없음'}`);
      console.log(`   - 시간: ${data.time || '없음'}`);
      console.log(`   - 연락처: ${data.contact || '없음'}`);
      console.log(`   - 등록일: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('ko-KR') : '없음'}`);
      
      // 신청 데이터 확인
      const applications = data.applications || [];
      console.log(`   - 신청 수: ${applications.length}개`);
      
      if (applications.length > 0) {
        console.log('   - 신청자 목록:');
        applications.forEach((app, appIndex) => {
          console.log(`     ${appIndex + 1}. ${app.name} (${app.status}) - ${app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleDateString('ko-KR') : '날짜 없음'}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ 체험단 데이터 확인 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkExperiences()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { checkExperiences };
