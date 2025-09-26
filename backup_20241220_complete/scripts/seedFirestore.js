// Firebase 데이터베이스에 체험단 데이터를 저장하는 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

// 체험단 데이터
const experiencesData = [
  {
    title: '【REVU 포인트_5만】TERRA LIGHT 무설탕 맥주',
    description: '한국 국민 맥주! 칼로리 33% 감소!',
    category: '배송형 체험',
    tags: ['식품', 'Revu 포인트'],
    participants: 40,
    maxParticipants: 20,
    daysLeft: 7,
    image: '/api/placeholder/300/200',
    isNew: false,
    status: 'recruiting',
    location: '배송형 체험',
    date: '2024년 10월 15일',
    time: '14:00 - 16:00',
    requirements: [
      '만 19세 이상 성인',
      '맥주에 대한 관심과 경험',
      '체험 후기 작성 가능',
      'SNS 계정 보유'
    ],
    benefits: [
      'REVU 포인트 50,000원 지급',
      '무료 맥주 체험',
      '브랜드 굿즈 증정',
      '특별 할인 혜택'
    ],
    contact: 'support@revu.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: '【주말 방문 가능】보승회관 신사역점',
    description: '순대국밥|백숙|돼지갈비탕 등 한식 체인점',
    category: '방문형 체험',
    tags: ['맛집 체험'],
    participants: 2,
    maxParticipants: 6,
    daysLeft: 8,
    image: '/api/placeholder/300/200',
    isNew: false,
    status: 'recruiting',
    location: '서울 강남구 신사동 123-45',
    date: '2024년 10월 20일',
    time: '12:00 - 14:00',
    requirements: [
      '만 18세 이상',
      '한식에 대한 관심',
      '체험 후기 작성 가능',
      '카메라 또는 스마트폰 보유'
    ],
    benefits: [
      '무료 식사 제공',
      '브랜드 굿즈 증정',
      '특별 할인 쿠폰',
      'VIP 멤버십 혜택'
    ],
    contact: 'restaurant@revu.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: '하리 원장님_헤어(고바이씬 헤어살롱)',
    description: '선미/배두나/한예슬/권상우/정혜성 동일 미용실',
    category: '방문형 체험',
    tags: ['미용/헤어'],
    participants: 2,
    maxParticipants: 3,
    daysLeft: 8,
    image: '/api/placeholder/300/200',
    isNew: false,
    status: 'recruiting',
    location: '서울 강남구 청담동 456-78',
    date: '2024년 10월 22일',
    time: '10:00 - 12:00',
    requirements: [
      '만 20세 이상',
      '헤어 스타일에 대한 관심',
      '체험 후기 작성 가능',
      'SNS 계정 보유'
    ],
    benefits: [
      '무료 헤어 스타일링',
      '전문가 컨설팅',
      '브랜드 제품 증정',
      'VIP 서비스 혜택'
    ],
    contact: 'hair@revu.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'MARITHE 광장시장점',
    description: '한국 인기 디자이너 브랜드 팝업',
    category: '방문형 체험',
    tags: ['패션 아이템'],
    participants: 41,
    maxParticipants: 15,
    daysLeft: 6,
    image: '/api/placeholder/300/200',
    isNew: false,
    status: 'ongoing',
    location: '서울 종로구 광장시장 내',
    date: '2024년 10월 18일',
    time: '15:00 - 17:00',
    requirements: [
      '만 18세 이상',
      '패션에 대한 관심',
      '체험 후기 작성 가능',
      '카메라 또는 스마트폰 보유'
    ],
    benefits: [
      '무료 패션 아이템',
      '디자이너와의 만남',
      '특별 할인 혜택',
      '브랜드 굿즈 증정'
    ],
    contact: 'fashion@revu.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: '【주말 방문 가능】서울88맥주',
    description: '종로 인기 소주방',
    category: '방문형 체험',
    tags: ['맛집 체험'],
    participants: 5,
    maxParticipants: 5,
    daysLeft: 7,
    image: '/api/placeholder/300/200',
    isNew: false,
    status: 'ongoing',
    location: '서울 종로구 인사동 789-12',
    date: '2024년 10월 19일',
    time: '19:00 - 21:00',
    requirements: [
      '만 19세 이상 성인',
      '소주에 대한 관심',
      '체험 후기 작성 가능',
      'SNS 계정 보유'
    ],
    benefits: [
      '무료 음식 및 음료',
      '브랜드 굿즈 증정',
      '특별 할인 쿠폰',
      'VIP 멤버십 혜택'
    ],
    contact: 'soju@revu.com',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: '서울랜드 방문',
    description: '한국 최대 종합 테마파크',
    category: '방문형 체험',
    tags: ['문화 체험'],
    participants: 15,
    maxParticipants: 10,
    daysLeft: 6,
    image: '/api/placeholder/300/200',
    isNew: false,
    status: 'ongoing',
    location: '경기도 과천시 막계동 40',
    date: '2024년 10월 17일',
    time: '10:00 - 18:00',
    requirements: [
      '만 18세 이상',
      '테마파크에 대한 관심',
      '체험 후기 작성 가능',
      '카메라 또는 스마트폰 보유'
    ],
    benefits: [
      '무료 입장권',
      '특별 체험 프로그램',
      '브랜드 굿즈 증정',
      'VIP 서비스 혜택'
    ],
    contact: 'theme@revu.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 기존 데이터 삭제 함수
async function clearExperiences() {
  try {
    console.log('기존 체험단 데이터 삭제 중...');
    const experiencesRef = collection(db, 'experiences');
    const snapshot = await getDocs(experiencesRef);
    
    const deletePromises = snapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, 'experiences', docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    console.log('기존 데이터 삭제 완료!');
  } catch (error) {
    console.error('데이터 삭제 중 오류:', error);
  }
}

// 데이터 저장 함수
async function seedExperiences() {
  try {
    console.log('체험단 데이터 저장 시작...');
    
    // 기존 데이터 삭제
    await clearExperiences();
    
    // 새 데이터 저장
    const experiencesRef = collection(db, 'experiences');
    
    for (const experience of experiencesData) {
      await addDoc(experiencesRef, experience);
      console.log(`✅ 저장 완료: ${experience.title}`);
    }
    
    console.log('🎉 모든 체험단 데이터가 성공적으로 저장되었습니다!');
    console.log(`📊 총 ${experiencesData.length}개의 체험단이 저장되었습니다.`);
    
  } catch (error) {
    console.error('❌ 데이터 저장 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedExperiences()
    .then(() => {
      console.log('✅ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

module.exports = { seedExperiences, clearExperiences };
