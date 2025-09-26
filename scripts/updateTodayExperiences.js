// 오늘 방문하는 체험단을 업데이트하는 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, updateDoc, doc, addDoc } = require('firebase/firestore');

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

// 오늘 방문하는 체험단 추가
async function addTodayExperiences() {
  try {
    console.log('오늘 방문하는 체험단 추가 시작...');
    
    const experiencesRef = collection(db, 'experiences');
    
    // 오늘 방문하는 체험단 데이터
    const todayExperiences = [
      {
        title: '【오늘 마감】크리스마스 특별 이벤트',
        description: '크리스마스 시즌 한정 특별 체험 이벤트 - 오늘 마감!',
        category: '방문형 체험',
        tags: ['이벤트', '크리스마스', '특별', '오늘마감'],
        participants: 18,
        maxParticipants: 25,
        daysLeft: 0, // 오늘 방문
        image: '/api/placeholder/300/200',
        isNew: true,
        status: 'recruiting',
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date()
      },
      {
        title: '【긴급】연말 특가 이벤트',
        description: '연말을 맞아 진행하는 특가 이벤트 - 오늘만!',
        category: '방문형 체험',
        tags: ['이벤트', '특가', '연말', '긴급'],
        participants: 12,
        maxParticipants: 20,
        daysLeft: 0, // 오늘 방문
        image: '/api/placeholder/300/200',
        isNew: true,
        status: 'recruiting',
        createdAt: new Date('2024-12-15'),
        updatedAt: new Date()
      }
    ];
    
    for (const experience of todayExperiences) {
      await addDoc(experiencesRef, experience);
      console.log(`✅ 추가 완료: ${experience.title}`);
    }
    
    console.log('🎉 오늘 방문하는 체험단이 성공적으로 추가되었습니다!');
    
  } catch (error) {
    console.error('❌ 체험단 추가 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  addTodayExperiences()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { addTodayExperiences };
