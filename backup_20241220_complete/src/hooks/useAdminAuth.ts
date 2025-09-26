import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { getUserByEmail } from '@/lib/userRoleService'

export const useAdminAuth = () => {
  const { user, isAuthenticated, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [userRole, setUserRole] = useState<'admin' | 'advertiser' | 'user' | null>(null)

  useEffect(() => {
    const checkAdminStatus = async () => {
      // 인증 로딩이 완료되지 않았으면 대기
      if (loading) {
        return
      }
      
      // 인증되지 않은 경우
      if (!isAuthenticated || !user || !user.email) {
        setIsAdmin(false)
        setUserRole(null)
        setAdminLoading(false)
        return
      }
      
      // 인증된 경우 권한 확인
      try {
        setAdminLoading(true)
        console.log('권한 확인 중:', user.email)
        const result = await getUserByEmail(user.email)
        
        if (result.success && result.user) {
          const role = result.user.role || 'user'
          console.log('사용자 역할:', role)
          setUserRole(role)
          setIsAdmin(role === 'admin')
        } else {
          console.log('사용자 정보를 찾을 수 없음')
          setIsAdmin(false)
          setUserRole('user')
        }
      } catch (error) {
        console.error('관리자 권한 확인 오류:', error)
        setIsAdmin(false)
        setUserRole('user')
      } finally {
        setAdminLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, isAuthenticated, loading])

  return {
    isAdmin,
    adminLoading,
    userRole,
    isAuthenticated,
    loading: loading || adminLoading
  }
}
