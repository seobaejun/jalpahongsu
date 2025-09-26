import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'

export interface User {
  uid: string
  email: string
  displayName: string
  role?: 'admin' | 'advertiser' | 'user'
  createdAt: Date
  updatedAt: Date
}

// 모든 사용자 목록 가져오기
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    
    const users = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        // Firestore Timestamp를 Date로 변환
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    }) as (User & { id: string })[]
    
    return { success: true, users }
  } catch (error) {
    console.error('사용자 목록 로딩 오류:', error)
    return { success: false, error }
  }
}

// 사용자 통계 가져오기
export const getUserStats = async () => {
  try {
    const usersRef = collection(db, 'users')
    const snapshot = await getDocs(usersRef)
    
    const totalUsers = snapshot.size
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsers = snapshot.docs.filter(doc => {
      const userData = doc.data()
      const createdAt = userData.createdAt
      return createdAt && createdAt >= today
    }).length
    
    return {
      success: true,
      stats: {
        totalUsers,
        todayUsers,
        thisWeekUsers: totalUsers // 간단하게 전체로 설정
      }
    }
  } catch (error) {
    console.error('사용자 통계 로딩 오류:', error)
    return { success: false, error }
  }
}
