import { storage } from './firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// 이미지 업로드
export const uploadImage = async (file: File, path: string): Promise<{ success: boolean; url?: string; error?: string | unknown }> => {
  try {
    console.log('=== 이미지 업로드 서비스 시작 ===')
    console.log('파일 정보:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type, 
      path 
    })
    
    // 인증 상태 확인
    const { auth } = await import('./firebase')
    const currentUser = auth.currentUser
    console.log('현재 인증된 사용자:', currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    } : '인증되지 않음')
    
    if (!currentUser) {
      console.error('❌ 인증되지 않은 사용자')
      return { success: false, error: { userMessage: '로그인이 필요합니다.' } }
    }
    
    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      console.error('잘못된 파일 타입:', file.type)
      return { success: false, error: '이미지 파일만 업로드 가능합니다.' }
    }
    
    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      console.error('파일 크기 초과:', file.size)
      return { success: false, error: '파일 크기는 5MB를 초과할 수 없습니다.' }
    }
    
    console.log('Firebase Storage 참조 생성:', path)
    // Firebase Storage에 업로드
    const storageRef = ref(storage, path)
    console.log('파일 업로드 시작...')
    console.log('Storage 참조:', storageRef)
    
    const snapshot = await uploadBytes(storageRef, file)
    console.log('✅ 업로드 완료!')
    console.log('업로드된 파일명:', snapshot.metadata.name)
    console.log('파일 크기:', snapshot.metadata.size)
    console.log('콘텐츠 타입:', snapshot.metadata.contentType)
    
    console.log('다운로드 URL 생성 중...')
    const downloadURL = await getDownloadURL(snapshot.ref)
    console.log('✅ 다운로드 URL 생성 완료:', downloadURL)
    
    return { success: true, url: downloadURL }
  } catch (error: unknown) {
    console.error('❌ 이미지 업로드 오류:', error)
    
    // 구체적인 에러 메시지 제공
    let errorMessage = '이미지 업로드에 실패했습니다.'
    if (error && typeof error === 'object' && 'code' in error) {
      const errorCode = (error as { code: string }).code
      if (errorCode === 'storage/unauthorized') {
        errorMessage = 'Storage 접근 권한이 없습니다. 로그인 상태를 확인해주세요.'
      } else if (errorCode === 'storage/retry-limit-exceeded') {
        errorMessage = '업로드 재시도 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      } else if (errorCode === 'storage/invalid-format') {
        errorMessage = '지원하지 않는 파일 형식입니다.'
      } else if (errorCode === 'storage/object-not-found') {
        errorMessage = 'Storage 객체를 찾을 수 없습니다.'
      } else if (errorCode === 'storage/bucket-not-found') {
        errorMessage = 'Storage 버킷을 찾을 수 없습니다.'
      }
    }
    
    return { success: false, error: errorMessage }
  }
}

// 이미지 삭제
export const deleteImage = async (url: string): Promise<{ success: boolean; error?: unknown }> => {
  try {
    // URL에서 파일 경로 추출
    const urlParts = url.split('/')
    const fileName = urlParts[urlParts.length - 1].split('?')[0]
    const path = `images/${fileName}`
    
    const imageRef = ref(storage, path)
    await deleteObject(imageRef)
    
    return { success: true }
  } catch (error) {
    console.error('이미지 삭제 오류:', error)
    return { success: false, error: error }
  }
}

// 이미지 미리보기 URL 생성
export const createPreviewURL = (file: File): string => {
  return URL.createObjectURL(file)
}

// 미리보기 URL 해제
export const revokePreviewURL = (url: string): void => {
  URL.revokeObjectURL(url)
}

// 여러 이미지 업로드
export const uploadImages = async (files: File[], path: string): Promise<string[]> => {
  try {
    console.log('=== 여러 이미지 업로드 시작 ===')
    console.log('파일 개수:', files.length)
    console.log('경로:', path)
    
    const uploadPromises = files.map(async (file, index) => {
      console.log(`이미지 ${index + 1} 업로드 시작:`, file.name)
      const result = await uploadImage(file, `${path}/${Date.now()}_${index}_${file.name}`)
      if (result.success && result.url) {
        console.log(`이미지 ${index + 1} 업로드 성공:`, result.url)
        return result.url
      } else {
        console.error(`이미지 ${index + 1} 업로드 실패:`, result.error)
        throw new Error(`이미지 ${index + 1} 업로드 실패: ${result.error}`)
      }
    })
    
    const urls = await Promise.all(uploadPromises)
    console.log('✅ 모든 이미지 업로드 완료:', urls)
    return urls
  } catch (error) {
    console.error('❌ 여러 이미지 업로드 오류:', error)
    throw error
  }
}
