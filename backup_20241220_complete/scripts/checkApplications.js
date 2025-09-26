const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs } = require('firebase/firestore')

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyD8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K",
  authDomain: "hongsu3.firebaseapp.com",
  projectId: "hongsu3",
  storageBucket: "hongsu3.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
}

// Firebase 초기화
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function checkApplications() {
  try {
    console.log('Firebase에서 신청서 조회 중...')
    
    const applicationsRef = collection(db, 'applications')
    const snapshot = await getDocs(applicationsRef)
    
    console.log(`총 신청서 수: ${snapshot.docs.length}`)
    
    if (snapshot.docs.length > 0) {
      console.log('\n신청서 목록:')
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        console.log(`${index + 1}. ID: ${doc.id}`)
        console.log(`   체험단 ID: ${data.experienceId}`)
        console.log(`   신청자: ${data.name}`)
        console.log(`   상태: ${data.status}`)
        console.log(`   생성일: ${data.createdAt}`)
        console.log('---')
      })
    } else {
      console.log('신청서가 없습니다.')
    }
    
  } catch (error) {
    console.error('신청서 조회 오류:', error)
  }
}

checkApplications()