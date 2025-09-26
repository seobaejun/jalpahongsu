const { initializeApp } = require('firebase/app')
const { getStorage, ref, listAll } = require('firebase/storage')

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
const storage = getStorage(app)

async function checkStorageBucket() {
  try {
    console.log('=== Firebase Storage 버킷 확인 ===')
    console.log('Storage Bucket:', firebaseConfig.storageBucket)
    
    // Storage 루트 참조
    const rootRef = ref(storage, '')
    console.log('Storage 루트 참조:', rootRef)
    
    // Storage 내용 나열
    console.log('Storage 내용 확인 중...')
    const result = await listAll(rootRef)
    
    console.log('📁 폴더 목록:')
    result.prefixes.forEach(folderRef => {
      console.log('  -', folderRef.name)
    })
    
    console.log('📄 파일 목록:')
    result.items.forEach(itemRef => {
      console.log('  -', itemRef.name)
    })
    
    if (result.prefixes.length === 0 && result.items.length === 0) {
      console.log('Storage가 비어있습니다.')
    }
    
    console.log('✅ Storage 접근 성공!')
    
  } catch (error) {
    console.error('❌ Storage 접근 실패:', error)
    console.error('오류 코드:', error.code)
    console.error('오류 메시지:', error.message)
    
    if (error.code === 'storage/unauthorized') {
      console.log('💡 Storage 규칙 문제입니다.')
      console.log('   Firebase Console에서 Storage 규칙을 확인하세요.')
    } else if (error.code === 'storage/object-not-found') {
      console.log('💡 Storage 버킷이 존재하지 않습니다.')
    }
  }
}

checkStorageBucket()
