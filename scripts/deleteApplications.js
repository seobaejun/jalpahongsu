const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore')

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

async function deleteApplications() {
  try {
    console.log('applications 컬렉션 삭제 시작...')
    
    const applicationsRef = collection(db, 'applications')
    const snapshot = await getDocs(applicationsRef)
    
    console.log(`총 ${snapshot.docs.length}개의 신청서를 삭제합니다.`)
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, 'applications', docSnapshot.id))
      console.log(`삭제됨: ${docSnapshot.id}`)
    }
    
    console.log('✅ applications 컬렉션 삭제 완료!')
    
  } catch (error) {
    console.error('❌ applications 컬렉션 삭제 오류:', error)
  }
}

deleteApplications()
