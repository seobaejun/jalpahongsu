import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore'
import { db } from './firebase'
import { Experience } from '@/types/database'

// 인스타그램 최근 체험단 목록 가져오기
export const getInstagramRecentExperiences = async (limitCount: number = 5) => {
  try {
    const experiencesRef = collection(db, 'instagram_experiences')
    const q = query(experiencesRef, orderBy('createdAt', 'desc'), limit(limitCount))
    const snapshot = await getDocs(q)
    
    const experiences = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Experience[]
    
    return { success: true, experiences }
  } catch (error) {
    console.error('인스타그램 최근 체험단 로딩 오류:', error)
    return { success: false, error }
  }
}

// 인스타그램 오늘 체험단 목록 가져오기
export const getInstagramTodayExperiences = async () => {
  try {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD 형식
    
    console.log('=== getInstagramTodayExperiences 시작 ===')
    console.log('오늘 날짜:', todayStr)
    
    const experiencesRef = collection(db, 'instagram_experiences')
    const snapshot = await getDocs(experiencesRef)
    
    console.log('인스타그램 체험단 문서 수:', snapshot.docs.length)
    
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
    
    // 오늘 날짜와 일치하는 체험단 필터링
    const todayExperiences = experiences.filter(experience => {
      if (!experience.date) return false
      
      let experienceDate: string
      
      if (typeof experience.date === 'string') {
        // 이미 YYYY-MM-DD 형식인 경우
        if (experience.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          experienceDate = experience.date
        } else {
          // 다른 형식의 날짜 문자열인 경우 Date 객체로 변환
          const date = new Date(experience.date)
          experienceDate = date.toISOString().split('T')[0]
        }
      } else if (experience.date && typeof experience.date === 'object' && 'seconds' in experience.date) {
        // Firestore Timestamp인 경우
        const timestamp = experience.date as { seconds: number }
        const date = new Date(timestamp.seconds * 1000)
        experienceDate = date.toISOString().split('T')[0]
      } else {
        return false
      }
      
      console.log(`체험단 ${experience.title} 날짜 비교:`, {
        experienceDate,
        todayStr,
        matches: experienceDate === todayStr
      })
      
      return experienceDate === todayStr
    })
    
    console.log('오늘 인스타그램 체험단:', todayExperiences.map(exp => ({ 
      id: exp.id, 
      title: exp.title, 
      date: exp.date
    })))
    
    return { success: true, experiences: todayExperiences }
  } catch (error) {
    console.error('인스타그램 오늘 체험단 로딩 오류:', error)
    return { success: false, error }
  }
}

// 인스타그램 체험단 통계 가져오기
export const getInstagramExperienceStats = async () => {
  try {
    console.log('=== getInstagramExperienceStats 시작 ===')
    const experiencesRef = collection(db, 'instagram_experiences')
    const snapshot = await getDocs(experiencesRef)
    
    console.log('인스타그램 체험단 문서 수:', snapshot.docs.length)
    
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
    
    console.log('인스타그램 체험단 목록:', experiences.map(exp => ({ 
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
    
    console.log('인스타그램 체험단 통계:', stats)
    
    return {
      success: true,
      stats
    }
  } catch (error) {
    console.error('인스타그램 체험단 통계 로딩 오류:', error)
    console.error('에러 상세:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }
  }
}

