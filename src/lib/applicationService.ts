import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface Application {
  id?: string
  experienceId: string
  experienceTitle: string
  name: string
  passportNumber: string
  visitDate: string
  visitTime: string
  visitTimePeriod: string // AM/PM
  visitTimeHour: string // 1-12
  visitTimeMinute: string // 00-55
  visitCount: string
  wechatId: string
  xiaohongshuId: string
  followerCount: string
  userId?: string // 사용자 ID 추가
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
  collectionSource?: 'experiences' | 'instagram_experiences' // 컬렉션 소스 추가
}

// 인스타그램 체험단 신청서 제출
export const submitInstagramApplication = async (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('=== 인스타그램 체험단 신청서 제출 시작 ===')
    console.log('신청 데이터:', application)
    
    const experienceRef = doc(db, 'instagram_experiences', application.experienceId)
    const experienceDoc = await getDoc(experienceRef)
    
    if (!experienceDoc.exists()) {
      console.error('인스타그램 체험단을 찾을 수 없습니다:', application.experienceId)
      return { success: false, error: '인스타그램 체험단을 찾을 수 없습니다.' }
    }
    
    const experienceData = experienceDoc.data()
    console.log('인스타그램 체험단 데이터:', experienceData.title)
    
    const currentApplications = experienceData.applications || []
    
    const newApplication = {
      id: Date.now().toString(), // 임시 ID
      ...application,
      userId: application.userId || '', // 사용자 ID 추가
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedApplications = [...currentApplications, newApplication]
    
    console.log('업데이트할 인스타그램 신청서 데이터:', updatedApplications)
    
    await updateDoc(experienceRef, {
      applications: updatedApplications
    })
    
    console.log('✅ 인스타그램 체험단 신청서 제출 완료')
    
    // 업데이트 확인
    const updatedDoc = await getDoc(experienceRef)
    const updatedData = updatedDoc.data()
    console.log('업데이트 후 인스타그램 신청서 수:', updatedData?.applications?.length || 0)
    
    return { success: true }
  } catch (error) {
    console.error('❌ 인스타그램 체험단 신청서 제출 오류:', error)
    return { success: false, error: '신청서 제출에 실패했습니다.' }
  }
}

// 신청서 제출 (experiences 컬렉션에만 저장 - 기존 방식 유지)
export const submitApplication = async (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('=== 신청서 제출 시작 ===')
    console.log('신청 데이터:', application)
    
    const experienceRef = doc(db, 'experiences', application.experienceId)
    const experienceDoc = await getDoc(experienceRef)
    
    if (!experienceDoc.exists()) {
      console.error('체험단을 찾을 수 없습니다:', application.experienceId)
      return { success: false, error: '체험단을 찾을 수 없습니다.' }
    }
    
    const experienceData = experienceDoc.data()
    console.log('체험단 데이터:', experienceData.title)
    
    const currentApplications = experienceData.applications || []
    
    const newApplication = {
      id: Date.now().toString(), // 임시 ID
      ...application,
      userId: application.userId || '', // 사용자 ID 추가
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedApplications = [...currentApplications, newApplication]
    
    console.log('업데이트할 신청서 데이터:', updatedApplications)
    
    await updateDoc(experienceRef, {
      applications: updatedApplications,
      updatedAt: new Date()
    })
    
    console.log('experiences 컬렉션 업데이트 완료')
    
    // 업데이트 확인
    const updatedDoc = await getDoc(experienceRef)
    const updatedData = updatedDoc.data()
    console.log('업데이트 후 신청서 수:', updatedData?.applications?.length || 0)
    
    return { success: true, id: newApplication.id }
  } catch (error) {
    console.error('신청서 제출 오류:', error)
    return { success: false, error }
  }
}

// 모든 신청서 조회 (experiences와 instagram_experiences 컬렉션에서)
export const getAllApplications = async () => {
  try {
    console.log('=== getAllApplications 시작 (두 컬렉션에서) ===')
    
    const allApplications: Application[] = []
    
    // 1. experiences 컬렉션에서 신청서 가져오기
    console.log('--- experiences 컬렉션 조회 시작 ---')
    const experiencesRef = collection(db, 'experiences')
    const experiencesSnapshot = await getDocs(experiencesRef)
    
    console.log('experiences 체험단 문서 수:', experiencesSnapshot.docs.length)
    
    experiencesSnapshot.docs.forEach((doc, index) => {
      const experienceData = doc.data()
      const applications = experienceData.applications || []
      
      console.log(`experiences 체험단 ${index + 1}: ${experienceData.title}, 신청 수: ${applications.length}`)
      
      applications.forEach((app: Application, appIndex: number) => {
        console.log(`  experiences 신청 ${appIndex + 1}:`, {
          name: app.name,
          status: app.status,
          createdAt: app.createdAt
        })
        
        // Firestore Timestamp를 Date로 변환
        const createdAt = app.createdAt
        const updatedAt = app.updatedAt
        
        allApplications.push({
          ...app,
          experienceId: doc.id,
          experienceTitle: experienceData.title,
          createdAt: createdAt,
          updatedAt: updatedAt,
          collectionSource: 'experiences' // 컬렉션 소스 추가
        })
      })
    })
    
    // 2. instagram_experiences 컬렉션에서 신청서 가져오기
    console.log('--- instagram_experiences 컬렉션 조회 시작 ---')
    const instagramExperiencesRef = collection(db, 'instagram_experiences')
    const instagramSnapshot = await getDocs(instagramExperiencesRef)
    
    console.log('instagram_experiences 체험단 문서 수:', instagramSnapshot.docs.length)
    
    instagramSnapshot.docs.forEach((doc, index) => {
      const experienceData = doc.data()
      const applications = experienceData.applications || []
      
      console.log(`instagram 체험단 ${index + 1}: ${experienceData.title}, 신청 수: ${applications.length}`)
      
      applications.forEach((app: Application, appIndex: number) => {
        console.log(`  instagram 신청 ${appIndex + 1}:`, {
          name: app.name,
          status: app.status,
          createdAt: app.createdAt
        })
        
        // Firestore Timestamp를 Date로 변환
        const createdAt = app.createdAt
        const updatedAt = app.updatedAt
        
        allApplications.push({
          ...app,
          experienceId: doc.id,
          experienceTitle: experienceData.title,
          createdAt: createdAt,
          updatedAt: updatedAt,
          collectionSource: 'instagram_experiences' // 컬렉션 소스 추가
        })
      })
    })
    
    console.log('총 신청 데이터 수:', allApplications.length)
    
    // 생성일 기준으로 정렬
    allApplications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return { success: true, applications: allApplications }
  } catch (error) {
    console.error('신청서 조회 오류:', error)
    return { success: false, error }
  }
}

// 인스타그램 체험단의 신청서 조회
export const getInstagramApplicationsByExperience = async (experienceId: string) => {
  try {
    console.log('getInstagramApplicationsByExperience 호출됨, experienceId:', experienceId)
    const experienceRef = doc(db, 'instagram_experiences', experienceId)
    const experienceDoc = await getDoc(experienceRef)
    
    if (!experienceDoc.exists()) {
      console.log('인스타그램 체험단 문서가 존재하지 않음:', experienceId)
      return { success: true, applications: [] }
    }
    
    const experienceData = experienceDoc.data()
    const applications = experienceData.applications || []
    
    console.log('인스타그램 체험단 신청서 수:', applications.length)
    return { success: true, applications }
  } catch (error) {
    console.error('인스타그램 체험단 신청서 조회 오류:', error)
    return { success: false, error }
  }
}

// 특정 체험단의 신청서 조회 (experiences 컬렉션에서)
export const getApplicationsByExperience = async (experienceId: string) => {
  try {
    console.log('getApplicationsByExperience 호출됨, experienceId:', experienceId)
    const experienceRef = doc(db, 'experiences', experienceId)
    const experienceDoc = await getDoc(experienceRef)
    
    if (!experienceDoc.exists()) {
      console.log('체험단 문서가 존재하지 않음:', experienceId)
      return { success: true, applications: [] }
    }
    
    const experienceData = experienceDoc.data()
    const applications = experienceData.applications || []
    
    console.log('체험단 데이터:', {
      title: experienceData.title,
      applicationsCount: applications.length,
      applications: applications
    })
    
    return { success: true, applications }
  } catch (error) {
    console.error('체험단별 신청서 조회 오류:', error)
    return { success: false, error }
  }
}

// 신청서 상태 업데이트 (experiences와 instagram_experiences 컬렉션에서)
export const updateApplicationStatus = async (applicationId: string, status: 'pending' | 'approved' | 'rejected') => {
  try {
    console.log('=== 신청서 상태 업데이트 시작 ===', { applicationId, status })
    
    // 1. experiences 컬렉션에서 신청서 찾기
    console.log('--- experiences 컬렉션에서 신청서 검색 ---')
    const experiencesRef = collection(db, 'experiences')
    const experiencesSnapshot = await getDocs(experiencesRef)
    
    for (const docSnapshot of experiencesSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications[applicationIndex].status = status
        applications[applicationIndex].updatedAt = new Date()
        
        await updateDoc(doc(db, 'experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('experiences 컬렉션에서 상태 업데이트 완료')
        return { success: true }
      }
    }
    
    // 2. instagram_experiences 컬렉션에서 신청서 찾기
    console.log('--- instagram_experiences 컬렉션에서 신청서 검색 ---')
    const instagramExperiencesRef = collection(db, 'instagram_experiences')
    const instagramSnapshot = await getDocs(instagramExperiencesRef)
    
    for (const docSnapshot of instagramSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('instagram_experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications[applicationIndex].status = status
        applications[applicationIndex].updatedAt = new Date()
        
        await updateDoc(doc(db, 'instagram_experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('instagram_experiences 컬렉션에서 상태 업데이트 완료')
        return { success: true }
      }
    }
    
    console.log('신청서를 찾을 수 없음:', applicationId)
    return { success: false, error: '신청서를 찾을 수 없습니다.' }
  } catch (error) {
    console.error('신청서 상태 업데이트 오류:', error)
    return { success: false, error }
  }
}

// 승인 취소 (승인된 신청을 대기중으로 변경)
export const cancelApproval = async (applicationId: string) => {
  try {
    console.log('=== 승인 취소 시작 ===', { applicationId })
    
    // 1. experiences 컬렉션에서 신청서 찾기
    console.log('--- experiences 컬렉션에서 신청서 검색 ---')
    const experiencesRef = collection(db, 'experiences')
    const experiencesSnapshot = await getDocs(experiencesRef)
    
    for (const docSnapshot of experiencesSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications[applicationIndex].status = 'pending'
        applications[applicationIndex].updatedAt = new Date()
        
        await updateDoc(doc(db, 'experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('experiences 컬렉션에서 승인 취소 완료')
        return { success: true }
      }
    }
    
    // 2. instagram_experiences 컬렉션에서 신청서 찾기
    console.log('--- instagram_experiences 컬렉션에서 신청서 검색 ---')
    const instagramExperiencesRef = collection(db, 'instagram_experiences')
    const instagramSnapshot = await getDocs(instagramExperiencesRef)
    
    for (const docSnapshot of instagramSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('instagram_experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications[applicationIndex].status = 'pending'
        applications[applicationIndex].updatedAt = new Date()
        
        await updateDoc(doc(db, 'instagram_experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('instagram_experiences 컬렉션에서 승인 취소 완료')
        return { success: true }
      }
    }
    
    console.log('신청서를 찾을 수 없음:', applicationId)
    return { success: false, error: '신청서를 찾을 수 없습니다.' }
  } catch (error) {
    console.error('승인 취소 오류:', error)
    return { success: false, error }
  }
}

// 거부 취소 (거부된 신청을 대기중으로 변경)
export const cancelRejection = async (applicationId: string) => {
  try {
    console.log('=== 거부 취소 시작 ===', { applicationId })
    
    // 1. experiences 컬렉션에서 신청서 찾기
    console.log('--- experiences 컬렉션에서 신청서 검색 ---')
    const experiencesRef = collection(db, 'experiences')
    const experiencesSnapshot = await getDocs(experiencesRef)
    
    for (const docSnapshot of experiencesSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications[applicationIndex].status = 'pending'
        applications[applicationIndex].updatedAt = new Date()
        
        await updateDoc(doc(db, 'experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('experiences 컬렉션에서 거부 취소 완료')
        return { success: true }
      }
    }
    
    // 2. instagram_experiences 컬렉션에서 신청서 찾기
    console.log('--- instagram_experiences 컬렉션에서 신청서 검색 ---')
    const instagramExperiencesRef = collection(db, 'instagram_experiences')
    const instagramSnapshot = await getDocs(instagramExperiencesRef)
    
    for (const docSnapshot of instagramSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('instagram_experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications[applicationIndex].status = 'pending'
        applications[applicationIndex].updatedAt = new Date()
        
        await updateDoc(doc(db, 'instagram_experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('instagram_experiences 컬렉션에서 거부 취소 완료')
        return { success: true }
      }
    }
    
    console.log('신청서를 찾을 수 없음:', applicationId)
    return { success: false, error: '신청서를 찾을 수 없습니다.' }
  } catch (error) {
    console.error('거부 취소 오류:', error)
    return { success: false, error }
  }
}

// 신청서 삭제 (experiences와 instagram_experiences 컬렉션에서)
export const deleteApplication = async (applicationId: string) => {
  try {
    console.log('=== 신청서 삭제 시작 ===', { applicationId })
    
    // 1. experiences 컬렉션에서 신청서 찾기
    console.log('--- experiences 컬렉션에서 신청서 검색 ---')
    const experiencesRef = collection(db, 'experiences')
    const experiencesSnapshot = await getDocs(experiencesRef)
    
    for (const docSnapshot of experiencesSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications.splice(applicationIndex, 1)
        
        await updateDoc(doc(db, 'experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('experiences 컬렉션에서 신청서 삭제 완료')
        return { success: true }
      }
    }
    
    // 2. instagram_experiences 컬렉션에서 신청서 찾기
    console.log('--- instagram_experiences 컬렉션에서 신청서 검색 ---')
    const instagramExperiencesRef = collection(db, 'instagram_experiences')
    const instagramSnapshot = await getDocs(instagramExperiencesRef)
    
    for (const docSnapshot of instagramSnapshot.docs) {
      const experienceData = docSnapshot.data()
      const applications = experienceData.applications || []
      
      const applicationIndex = applications.findIndex((app: Application) => app.id === applicationId)
      if (applicationIndex !== -1) {
        console.log('instagram_experiences 컬렉션에서 신청서 발견:', {
          experienceId: docSnapshot.id,
          experienceTitle: experienceData.title,
          applicationName: applications[applicationIndex].name
        })
        
        applications.splice(applicationIndex, 1)
        
        await updateDoc(doc(db, 'instagram_experiences', docSnapshot.id), {
          applications,
          updatedAt: new Date()
        })
        
        console.log('instagram_experiences 컬렉션에서 신청서 삭제 완료')
        return { success: true }
      }
    }
    
    console.log('신청서를 찾을 수 없음:', applicationId)
    return { success: false, error: '신청서를 찾을 수 없습니다.' }
  } catch (error) {
    console.error('신청서 삭제 오류:', error)
    return { success: false, error }
  }
}

// 신청 통계 조회 (experiences와 instagram_experiences 컬렉션에서)
export const getApplicationStats = async () => {
  try {
    console.log('=== getApplicationStats 시작 (두 컬렉션에서) ===')
    
    const allApplications: Application[] = []
    
    // 1. experiences 컬렉션에서 신청서 가져오기
    console.log('--- experiences 컬렉션 통계 조회 시작 ---')
    const experiencesRef = collection(db, 'experiences')
    const experiencesSnapshot = await getDocs(experiencesRef)
    
    console.log('experiences 체험단 문서 수:', experiencesSnapshot.docs.length)
    
    experiencesSnapshot.docs.forEach(doc => {
      const experienceData = doc.data()
      const applications = experienceData.applications || []
      
      applications.forEach((app: Application) => {
        // Firestore Timestamp를 Date로 변환
        const createdAt = app.createdAt
        const updatedAt = app.updatedAt
        
        allApplications.push({
          ...app,
          createdAt: createdAt,
          updatedAt: updatedAt
        })
      })
    })
    
    // 2. instagram_experiences 컬렉션에서 신청서 가져오기
    console.log('--- instagram_experiences 컬렉션 통계 조회 시작 ---')
    const instagramExperiencesRef = collection(db, 'instagram_experiences')
    const instagramSnapshot = await getDocs(instagramExperiencesRef)
    
    console.log('instagram_experiences 체험단 문서 수:', instagramSnapshot.docs.length)
    
    instagramSnapshot.docs.forEach(doc => {
      const experienceData = doc.data()
      const applications = experienceData.applications || []
      
      applications.forEach((app: Application) => {
        // Firestore Timestamp를 Date로 변환
        const createdAt = app.createdAt
        const updatedAt = app.updatedAt
        
        allApplications.push({
          ...app,
          createdAt: createdAt,
          updatedAt: updatedAt
        })
      })
    })
    
    const stats = {
      total: allApplications.length,
      pending: allApplications.filter(app => app.status === 'pending').length,
      approved: allApplications.filter(app => app.status === 'approved').length,
      rejected: allApplications.filter(app => app.status === 'rejected').length
    }
    
    console.log('총 신청 통계:', stats)
    
    return { success: true, stats }
  } catch (error) {
    console.error('신청 통계 조회 오류:', error)
    return { success: false, error }
  }
}

// 기존 experiences 컬렉션의 신청 데이터를 applications 컬렉션으로 마이그레이션
export const migrateApplicationsToCollection = async () => {
  try {
    console.log('=== 신청 데이터 마이그레이션 시작 ===')
    
    const experiencesRef = collection(db, 'experiences')
    const snapshot = await getDocs(experiencesRef)
    
    console.log('체험단 문서 수:', snapshot.docs.length)
    
    let migratedCount = 0
    
    for (const doc of snapshot.docs) {
      const experienceData = doc.data()
      const applications = experienceData.applications || []
      
      console.log(`체험단 "${experienceData.title}"의 신청 수: ${applications.length}`)
      
      for (const app of applications) {
        try {
          // applications 컬렉션에 이미 존재하는지 확인
          const { query, where, getDocs } = await import('firebase/firestore')
          const applicationsRef = collection(db, 'applications')
          const q = query(applicationsRef, where('experienceId', '==', doc.id), where('name', '==', app.name))
          const existingSnapshot = await getDocs(q)
          
          if (existingSnapshot.empty) {
            // 존재하지 않으면 추가
            const { addDoc } = await import('firebase/firestore')
            const newApplication = {
              experienceId: doc.id,
              experienceTitle: experienceData.title,
              name: app.name,
              passportNumber: app.passportNumber || '',
              visitDate: app.visitDate || '',
              visitTime: app.visitTime || '',
              visitTimePeriod: app.visitTimePeriod || '',
              visitTimeHour: app.visitTimeHour || '',
              visitTimeMinute: app.visitTimeMinute || '',
              visitCount: app.visitCount || '1',
              wechatId: app.wechatId || '',
              xiaohongshuId: app.xiaohongshuId || '',
              followerCount: app.followerCount || 0,
              status: app.status || 'pending',
              createdAt: app.createdAt || new Date(),
              updatedAt: app.updatedAt || new Date()
            }
            
            await addDoc(applicationsRef, newApplication)
            migratedCount++
            console.log(`마이그레이션 완료: ${app.name}`)
          } else {
            console.log(`이미 존재: ${app.name}`)
          }
        } catch (error) {
          console.error(`마이그레이션 오류 (${app.name}):`, error)
        }
      }
    }
    
    console.log(`마이그레이션 완료: ${migratedCount}개 신청 데이터`)
    return { success: true, migratedCount }
  } catch (error) {
    console.error('마이그레이션 오류:', error)
    return { success: false, error }
  }
}
