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

async function testWithDifferentAuth() {
  try {
    console.log('=== Firebase Storage 규칙 테스트 ===')
    
    // 여러 계정으로 테스트
    const testAccounts = [
      { email: 'sprince1004@naver.com', password: 'password123' },
      { email: 'test1@example.com', password: 'password123' }
    ]
    
    for (const account of testAccounts) {
      try {
        console.log(`\n--- ${account.email} 계정으로 테스트 ---`)
        
        // 로그인 시도
        const userCredential = await signInWithEmailAndPassword(auth, account.email, account.password)
        console.log('✅ 로그인 성공:', userCredential.user.email)
        
        // 테스트 이미지 생성
        const testImageData = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG 시그니처
          0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR 청크
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 픽셀
          0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE
        ])
        
        const timestamp = Date.now()
        const fileName = `test_${account.email.split('@')[0]}_${timestamp}.png`
        const storagePath = `images/${fileName}`
        
        console.log('Storage 경로:', storagePath)
        
        // Storage에 업로드
        const storageRef = ref(storage, storagePath)
        const snapshot = await uploadBytes(storageRef, testImageData)
        console.log('✅ 업로드 성공!')
        
        // 다운로드 URL 가져오기
        const downloadURL = await getDownloadURL(snapshot.ref)
        console.log('다운로드 URL:', downloadURL)
        
        console.log(`✅ ${account.email} 계정으로 Storage 접근 성공!`)
        break // 성공하면 중단
        
      } catch (error) {
        console.error(`❌ ${account.email} 계정 테스트 실패:`, error.message)
        
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          console.log('계정 정보가 올바르지 않습니다.')
        } else if (error.code === 'storage/unauthorized') {
          console.log('Storage 접근 권한이 없습니다.')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 전체 테스트 실패:', error)
  }
}

testWithDifferentAuth()
