// 예시 체험단 데이터를 Firestore에 추가하는 스크립트
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

// 예시 체험단 데이터 (최근 추가된 것들)
const exampleExperiences = [
  {
    title: '【신규】삼성 갤럭시 S24 울트라 체험',
    description: '최신 갤럭시 S24 울트라를 체험하고 리뷰를 작성해주세요',
    category: '배송형 체험',
    tags: ['전자제품', '스마트폰', '삼성'],
    participants: 8,
    maxParticipants: 15,
    daysLeft: 12,
    image: '/api/placeholder/300/200',
    isNew: true,
    status: 'recruiting',
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date()
  },
  {
    title: '【주말 특별】롯데월드 어드벤처 방문',
    description: '롯데월드에서 즐거운 시간을 보내고 후기를 남겨주세요',
    category: '방문형 체험',
    tags: ['테마파크', '가족', '주말'],
    participants: 12,
    maxParticipants: 20,
    daysLeft: 5,
    image: '/api/placeholder/300/200',
    isNew: true,
    status: 'recruiting',
    createdAt: new Date('2024-12-18'),
    updatedAt: new Date()
  },
  {
    title: '【한정】스타벅스 신메뉴 체험',
    description: '스타벅스 신메뉴를 맛보고 솔직한 후기를 작성해주세요',
    category: '방문형 체험',
    tags: ['카페', '음료', '스타벅스'],
    participants: 25,
    maxParticipants: 30,
    daysLeft: 8,
    image: '/api/placeholder/300/200',
    isNew: true,
    status: 'recruiting',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date()
  },
  {
    title: '【긴급】크리스마스 특별 이벤트',
    description: '크리스마스 시즌 한정 특별 체험 이벤트입니다',
    category: '방문형 체험',
    tags: ['이벤트', '크리스마스', '특별'],
    participants: 18,
    maxParticipants: 25,
    daysLeft: 1, // 오늘 방문
    image: '/api/placeholder/300/200',
    isNew: true,
    status: 'recruiting',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date()
  },
  {
    title: '【신제품】아이폰 15 Pro Max 체험',
    description: '최신 아이폰 15 Pro Max를 체험하고 상세 리뷰를 작성해주세요',
    category: '배송형 체험',
    tags: ['전자제품', '스마트폰', '애플'],
    participants: 5,
    maxParticipants: 10,
    daysLeft: 15,
    image: '/api/placeholder/300/200',
    isNew: true,
    status: 'recruiting',
    createdAt: new Date('2024-12-22'),
    updatedAt: new Date()
  }
];

// 예시 체험단 추가 함수
async function addExampleExperiences() {
  try {
    console.log('예시 체험단 데이터 추가 시작...');
    console.log(`총 ${exampleExperiences.length}개의 체험단을 추가합니다.`);
    
    const experiencesRef = collection(db, 'experiences');
    
    for (const experience of exampleExperiences) {
      await addDoc(experiencesRef, experience);
      console.log(`✅ 추가 완료: ${experience.title}`);
    }
    
    console.log('🎉 모든 예시 체험단이 성공적으로 추가되었습니다!');
    console.log(`📊 총 ${exampleExperiences.length}개의 체험단이 추가되었습니다.`);
    
  } catch (error) {
    console.error('❌ 체험단 추가 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  addExampleExperiences()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { addExampleExperiences };
