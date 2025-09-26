import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from './firebase'
import { Experience } from '@/types/database'

// 최근 체험단 목록 가져오기
export const getRecentExperiences = async (limitCount: number = 5) => {
  try {
    const experiencesRef = collection(db, 'experiences')
    const q = query(experiencesRef, orderBy('createdAt', 'desc'), limit(limitCount))
    const snapshot = await getDocs(q)
    
    const experiences = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Experience[]
    
    return { success: true, experiences }
  } catch (error) {
    console.error('최근 체험단 로딩 오류:', error)
    return { success: false, error }
  }
}

// 오늘 방문하는 체험단 가져오기 (오늘 날짜와 일치하는 체험단)
export const getTodayExperiences = async () => {
  try {
    console.log('=== getTodayExperiences 시작 ===')
    const experiencesRef = collection(db, 'experiences')
    const snapshot = await getDocs(experiencesRef)
    
    const today = new Date()
    const todayString = today.toISOString().split('T')[0] // YYYY-MM-DD 형식
    
    console.log('오늘 날짜:', todayString)
    
    const experiences = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Experience[]
    
    // 오늘 날짜와 일치하는 체험단 필터링
    const todayExperiences = experiences.filter(exp => {
      if (!exp.date) return false
      
      // 날짜 형식 변환 (다양한 형식 지원)
      let expDateString = ''
      if (exp.date instanceof Date) {
        expDateString = exp.date.toISOString().split('T')[0]
      } else if (typeof exp.date === 'string') {
        // YYYY-MM-DD 형식인지 확인
        if (exp.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          expDateString = exp.date
        } else {
          // 다른 형식이면 Date로 변환 시도
          try {
            const date = new Date(exp.date)
            expDateString = date.toISOString().split('T')[0]
          } catch (e) {
            console.warn('날짜 변환 실패:', exp.date)
            return false
          }
        }
      }
      
      const isToday = expDateString === todayString
      if (isToday) {
        console.log('오늘 체험단 발견:', exp.title, exp.date)
      }
      return isToday
    })
    
    console.log('오늘 체험단 수:', todayExperiences.length)
    
    return { success: true, experiences: todayExperiences }
  } catch (error) {
    console.error('오늘 체험단 로딩 오류:', error)
    return { success: false, error }
  }
}

// 체험단 통계 가져오기
export const getExperienceStats = async () => {
  try {
    console.log('=== getExperienceStats 시작 ===')
    const experiencesRef = collection(db, 'experiences')
    const snapshot = await getDocs(experiencesRef)
    
    console.log('체험단 문서 수:', snapshot.docs.length)
    
    const experiences = snapshot.docs.map(doc => {
      try {
        const data = doc.data()
        return {
          id: doc.id,
          ...data
        }
      } catch (docError) {
        console.error('문서 파싱 오류:', doc.id, docError)
        return null
      }
    }).filter(Boolean) as Experience[]
    
    console.log('체험단 목록:', experiences.map(exp => ({ 
      id: exp.id, 
      title: exp.title, 
      status: exp.status
    })))
    
    const recruiting = experiences.filter(exp => exp.status === 'recruiting').length
    const ongoing = experiences.filter(exp => exp.status === 'ongoing').length
    const completed = experiences.filter(exp => exp.status === 'completed').length
    
    const stats = {
      total: experiences.length,
      recruiting,
      ongoing,
      completed
    }
    
    console.log('체험단 통계:', stats)
    
    return {
      success: true,
      stats
    }
  } catch (error) {
    console.error('체험단 통계 로딩 오류:', error)
    console.error('에러 상세:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }
}
