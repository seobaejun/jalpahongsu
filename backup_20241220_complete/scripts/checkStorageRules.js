const { initializeApp } = require('firebase/app')
const { getStorage, connectStorageEmulator } = require('firebase/storage')

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

console.log('Firebase Storage 초기화 완료')
console.log('Storage Bucket:', firebaseConfig.storageBucket)

// Storage 규칙 확인을 위한 테스트
async function testStorageAccess() {
  try {
    const { ref, uploadBytes, getDownloadURL } = require('firebase/storage')
    
    // 테스트 파일 생성
    const testFile = new Blob(['test content'], { type: 'text/plain' })
    const testRef = ref(storage, 'test/test-file.txt')
    
    console.log('Storage 테스트 시작...')
    
    // 업로드 테스트
    const snapshot = await uploadBytes(testRef, testFile)
    console.log('업로드 성공:', snapshot.metadata.name)
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('다운로드 URL:', downloadURL)
    
    console.log('✅ Firebase Storage 접근 가능')
    
  } catch (error) {
    console.error('❌ Firebase Storage 오류:', error)
    console.error('오류 코드:', error.code)
    console.error('오류 메시지:', error.message)
    
    if (error.code === 'storage/unauthorized') {
      console.log('💡 해결 방법: Firebase Console에서 Storage 규칙을 확인하세요')
      console.log('   규칙 예시:')
      console.log('   rules_version = "2";')
      console.log('   service firebase.storage {')
      console.log('     match /b/{bucket}/o {')
      console.log('       match /{allPaths=**} {')
      console.log('         allow read, write: if request.auth != null;')
      console.log('       }')
      console.log('     }')
      console.log('   }')
    }
  }
}

testStorageAccess()
