import { doc, updateDoc, deleteDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'

export type UserRole = 'admin' | 'advertiser' | 'user'

export interface UserWithRole {
  id: string
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

// 사용자 역할 업데이트
export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      role,
      updatedAt: new Date()
    })
    return { success: true }
  } catch (error) {
    console.error('사용자 역할 업데이트 오류:', error)
    return { success: false, error }
  }
}

// 사용자 삭제
export const deleteUser = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId)
    await deleteDoc(userRef)
    return { success: true }
  } catch (error) {
    console.error('사용자 삭제 오류:', error)
    return { success: false, error }
  }
}

// 사용자 정보 가져오기 (이메일로 검색)
export const getUserByEmail = async (email: string) => {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0]
      return { 
        success: true, 
        user: { id: userDoc.id, ...userDoc.data() } as UserWithRole 
      }
    } else {
      return { success: false, error: '사용자를 찾을 수 없습니다' }
    }
  } catch (error) {
    console.error('사용자 정보 로딩 오류:', error)
    return { success: false, error }
  }
}

// 사용자 정보 가져오기 (ID로 검색)
export const getUserById = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { 
        success: true, 
        user: { id: userSnap.id, ...userSnap.data() } as UserWithRole 
      }
    } else {
      return { success: false, error: '사용자를 찾을 수 없습니다' }
    }
  } catch (error) {
    console.error('사용자 정보 로딩 오류:', error)
    return { success: false, error }
  }
}
