const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore')

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyBozZHNiZa7m_MznFzzcj-xRxf2J7bjeOo",
  authDomain: "hongsu-9d9c2.firebaseapp.com",
  projectId: "hongsu-9d9c2",
  storageBucket: "hongsu-9d9c2.firebasestorage.app",
  messagingSenderId: "102045054206",
  appId: "1:102045054206:web:1f060f9e06af0b7e6fe1af",
  measurementId: "G-2SDG086GFP"
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function addTestExperience() {
  try {
    console.log('테스트 체험단 카드 생성 중...')
    
    // 현재 날짜 기준으로 날짜 설정
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const twoWeeksLater = new Date(today)
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14)
    
    const testExperience = {
      activityType: 'experience',
      title: '【주말 방문 가능】보승회관 신사역점',
      titleZh: '【周末可访问】保胜会馆新沙站店',
      description: '보승회관 신사역점에서 맛있는 한식을 체험해보세요. 주말에도 방문 가능하며, 전문 셰프가 직접 조리한 정통 한식을 맛볼 수 있습니다.',
      descriptionZh: '在保胜会馆新沙站店体验美味的韩式料理。周末也可以访问，可以品尝到专业厨师亲自制作的正宗韩式料理。',
      category: 'restaurant',
      maxParticipants: 5,
      participants: 0,
      daysLeft: 7,
      image: 'https://picsum.photos/500/300?random=1',
      images: [
        'https://picsum.photos/500/300?random=2'
      ],
      isNew: false,
      status: 'recruiting',
      recruitmentStartDate: today.toISOString().split('T')[0], // 오늘부터
      recruitmentEndDate: nextWeek.toISOString().split('T')[0], // 일주일 후까지
      date: twoWeeksLater.toISOString().split('T')[0], // 2주일 후 체험
      time: '14:00',
      location: '서울 강남구 신사동 123-45',
      locationZh: '首尔江南区新沙洞123-45',
      benefits: [
        '무료 한식 체험',
        '전문 셰프와의 만남',
        '기념품 증정'
      ],
      benefitsZh: [
        '免费韩式料理体验',
        '与专业厨师见面',
        '赠送纪念品'
      ],
      requirements: [
        '만 18세 이상',
        '위쳇 ID 필수',
        '샤오홍슈 팔로워 1000명 이상'
      ],
      requirementsZh: [
        '18岁以上',
        '必须提供微信ID',
        '小红书粉丝1000人以上'
      ],
      contact: 'support@naver.com',
      applications: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }
    
    const experiencesRef = collection(db, 'experiences')
    const docRef = await addDoc(experiencesRef, testExperience)
    
    console.log('테스트 체험단 카드가 성공적으로 생성되었습니다!')
    console.log('문서 ID:', docRef.id)
    console.log('제목:', testExperience.title)
    console.log('중국어 제목:', testExperience.titleZh)
    console.log('장소:', testExperience.location)
    console.log('중국어 장소:', testExperience.locationZh)
    
  } catch (error) {
    console.error('테스트 체험단 카드 생성 실패:', error)
  }
}

addTestExperience()
