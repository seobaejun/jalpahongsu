// 체험단 데이터를 삭제하는 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

// 체험단 데이터 삭제
async function deleteExperiences() {
  try {
    console.log('체험단 데이터 삭제 시작...');
    
    const experiencesRef = collection(db, 'experiences');
    const snapshot = await getDocs(experiencesRef);
    
    console.log(`총 ${snapshot.size}개의 체험단을 삭제합니다...`);
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, 'experiences', docSnapshot.id));
      console.log(`✅ 삭제 완료: ${docSnapshot.data().title}`);
    }
    
    console.log('🎉 모든 체험단 데이터가 삭제되었습니다!');
    
  } catch (error) {
    console.error('❌ 체험단 데이터 삭제 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  deleteExperiences()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { deleteExperiences };
