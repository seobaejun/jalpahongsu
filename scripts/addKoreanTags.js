// 한국어 태그를 추가하는 스크립트
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

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

// 한국어 태그 매핑
const koreanTags = {
  '4o1aNy3b15d7HfN9XeUh': ['닭고기요리', '강남맛집', '한국요리', '전문점', '맛집추천'],
  '5RhtNI7xEQ7UzWkASbkY': ['마사지', '성수동', '프리미엄', '힐링', '스파'],
  'HcE2sh1OIERZiIw8v8RH': ['모밀', '막불감동', 'TV출연', '맛집', '신림역'],
  'NYdF41lNNACHOD9muhgS': ['청담동', '맛집', '필수방문', '고급요리', '강남'],
  'NwcBp1Q1pHXTqUY7w1Ku': ['아운티제니', '한국1호점', '디저트', '오픈체험', '신상품'],
  'SvPRUmliHfzqwJVlCRdy': ['순대국밥', '수육', '강남맛집', '한국전통음식', '해장국'],
  'f8LJqZT4RXCCW7NNuMZ6': ['삼겹살', '성신여대', '맛집', '고기요리', '한국바베큐'],
  'hQ0Gv16p3555NchBnzs2': ['피부과', '줄기세포', '대구', '프리미엄', '피부관리'],
  'jQVU9z3KJP0YhoVkbxnq': ['피부과', '신사역', '플래티넘', '강남', '피부관리'],
  'paxAGU50m3DlEUX7m57A': ['와인바', '강남핫플', '야간', '분위기', '데이트'],
  'uNV3SFNlAcm0iHMGj6sP': ['고기맛집', '부산', '푸주인', '서면', '한국고기'],
  'w2RnKIxPSqvElxvafTSU': ['헤어메이크업', '연예인', '뷰티', '강남', '스타일링']
};

// 한국어 태그 추가
async function addKoreanTags() {
  try {
    console.log('한국어 태그 추가 시작...');
    
    const experiencesRef = collection(db, 'experiences');
    const snapshot = await getDocs(experiencesRef);
    
    let updatedCount = 0;
    
    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      const data = docSnapshot.data();
      
      if (koreanTags[docId] && (!data.tags || data.tags.length === 0)) {
        const docRef = doc(db, 'experiences', docId);
        await updateDoc(docRef, {
          tags: koreanTags[docId]
        });
        
        console.log(`✅ ${data.title} - 한국어 태그 추가: ${koreanTags[docId].join(', ')}`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ 총 ${updatedCount}개의 체험단에 한국어 태그가 추가되었습니다.`);
    
  } catch (error) {
    console.error('❌ 한국어 태그 추가 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  addKoreanTags().then(() => {
    console.log('✅ 스크립트 실행 완료');
    process.exit(0);
  }).catch(error => {
    console.error('❌ 스크립트 실행 오류:', error);
    process.exit(1);
  });
}

module.exports = { addKoreanTags };
