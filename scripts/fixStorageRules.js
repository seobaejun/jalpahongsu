const { initializeApp } = require('firebase/app')
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth')
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage')

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
const auth = getAuth(app)
const storage = getStorage(app)

async function testStorageWithAuth() {
  try {
    console.log('관리자 계정으로 로그인 시도...')
    
    // 관리자 계정으로 로그인
    const userCredential = await signInWithEmailAndPassword(auth, 'sprince1004@naver.com', 'password123')
    console.log('로그인 성공:', userCredential.user.email)
    
    // 테스트 이미지 파일 생성 (실제 이미지 파일 시뮬레이션)
    const testImageData = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 시그니처
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR 청크
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 픽셀
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE
    ])
    
    const testFile = new Blob([testImageData], { type: 'image/png' })
    const timestamp = Date.now()
    const fileName = `test_${timestamp}.png`
    const storagePath = `images/${fileName}`
    
    console.log('Storage 경로:', storagePath)
    console.log('파일 크기:', testFile.size, 'bytes')
    
    // Storage에 업로드
    const storageRef = ref(storage, storagePath)
    console.log('업로드 시작...')
    
    const snapshot = await uploadBytes(storageRef, testFile)
    console.log('업로드 성공!')
    console.log('파일명:', snapshot.metadata.name)
    console.log('크기:', snapshot.metadata.size)
    console.log('타입:', snapshot.metadata.contentType)
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('다운로드 URL:', downloadURL)
    
    console.log('✅ Firebase Storage 테스트 성공!')
    console.log('💡 이제 웹 애플리케이션에서 이미지 업로드가 작동해야 합니다.')
    
  } catch (error) {
    console.error('❌ Firebase Storage 테스트 실패:', error)
    console.error('오류 코드:', error.code)
    console.error('오류 메시지:', error.message)
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      console.log('💡 해결 방법: 관리자 계정 정보를 확인하세요')
      console.log('   이메일: sprince1004@naver.com')
      console.log('   비밀번호: password123')
    } else if (error.code === 'storage/unauthorized') {
      console.log('💡 해결 방법: Firebase Console에서 Storage 규칙을 수정하세요')
      console.log('   Firebase Console > Storage > Rules 탭에서 다음 규칙을 설정:')
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

testStorageWithAuth()
