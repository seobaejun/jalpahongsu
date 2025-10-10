'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { seedExperiences, resetExperiences } from '@/lib/seedData'
import { getAllUsers, getUserStats, User } from '@/lib/userService'
import { getRecentExperiences, getTodayExperiences, getExperienceStats } from '@/lib/experienceService'
import { getInstagramRecentExperiences, getInstagramTodayExperiences, getInstagramExperienceStats } from '@/lib/instagramExperienceService'
import { Experience } from '@/types/database'
import { updateUserRole, deleteUser, UserRole } from '@/lib/userRoleService'
import { getAllApplications, getApplicationStats, updateApplicationStatus, deleteApplication, cancelApproval, cancelRejection, Application, migrateApplicationsToCollection } from '@/lib/applicationService'
import { 
  Users, 
  Activity, 
  BarChart3, 
  RefreshCw,
  UserCheck,
  Calendar,
  TrendingUp,
  Shield,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  List
} from 'lucide-react'

export default function AdminPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const { isAdmin, adminLoading, userRole } = useAdminAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [users, setUsers] = useState<(User & { id: string })[]>([])
  const [userStats, setUserStats] = useState({ totalUsers: 0, todayUsers: 0, thisWeekUsers: 0 })
  const [usersLoading, setUsersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // 카드 생성 관련 상태
  const [cardForm, setCardForm] = useState({
    activityType: '',
    title: '',
    titleEn: '',
    titleZh: '',
    category: '',
    customCategory: '',
    description: '',
    descriptionEn: '',
    descriptionZh: '',
    maxParticipants: '',
    experienceStartDate: '',
    experienceEndDate: '',
    recruitmentStartDate: '',
    recruitmentEndDate: '',
    location: '',
    locationEn: '',
    locationZh: '',
    tags: [''],
    tagsEn: [''],
    tagsZh: [''],
    benefits: [''],
    benefitsEn: [''],
    benefitsZh: [''],
    requirements: [''],
    requirementsEn: [''],
    requirementsZh: [''],
    image: null as File | null,
    imagePreview: '',
    images: [] as File[],
    imagePreviews: [] as string[]
  })
  const [showCustomCategory, setShowCustomCategory] = useState(false)
  const [cardSubmitting, setCardSubmitting] = useState(false)
  const [cardMessage, setCardMessage] = useState('')
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  
  const [recentExperiences, setRecentExperiences] = useState<Experience[]>([])
  const [todayExperiences, setTodayExperiences] = useState<Experience[]>([])
  const [experienceStats, setExperienceStats] = useState({ total: 0, recruiting: 0, ongoing: 0, completed: 0 })
  
  // 인스타그램 관련 상태
  const [instagramRecentExperiences, setInstagramRecentExperiences] = useState<Experience[]>([])
  const [instagramTodayExperiences, setInstagramTodayExperiences] = useState<Experience[]>([])
  const [instagramStats, setInstagramStats] = useState({ total: 0, recruiting: 0, ongoing: 0, completed: 0 })
  const [instagramLoading, setInstagramLoading] = useState(false)
  const [instagramApplicationStats, setInstagramApplicationStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [instagramUserStats, setInstagramUserStats] = useState({ totalUsers: 0, todayUsers: 0, thisWeekUsers: 0 })
  const [instagramExperienceApplicationCounts, setInstagramExperienceApplicationCounts] = useState<Record<string, number>>({})
  
  // 인스타그램 체험단 관리 관련 상태
  const [instagramAllExperiences, setInstagramAllExperiences] = useState<Experience[]>([])
  const [instagramExperiencesLoading, setInstagramExperiencesLoading] = useState(false)
  const [instagramExperienceMessage, setInstagramExperienceMessage] = useState('')
  
  // 인스타그램 신청 관리 관련 상태
  const [instagramApplications, setInstagramApplications] = useState<Application[]>([])
  const [instagramApplicationMessage, setInstagramApplicationMessage] = useState('')
  const [instagramApplicationFilter, setInstagramApplicationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  
  // 인스타그램 카드 만들기 관련 상태
  const [instagramCardForm, setInstagramCardForm] = useState({
    activityType: '',
    title: '',
    titleEn: '',
    titleZh: '',
    category: '',
    customCategory: '',
    description: '',
    descriptionEn: '',
    descriptionZh: '',
    maxParticipants: '',
    experienceStartDate: '',
    experienceEndDate: '',
    recruitmentStartDate: '',
    recruitmentEndDate: '',
    location: '',
    locationEn: '',
    locationZh: '',
    tags: [''],
    tagsEn: [''],
    benefits: [''],
    benefitsEn: [''],
    benefitsZh: [''],
    requirements: [''],
    requirementsEn: [''],
    requirementsZh: [''],
    image: null as File | null,
    imagePreview: '',
    images: [] as File[],
    imagePreviews: [] as string[]
  })
  const [instagramShowCustomCategory, setInstagramShowCustomCategory] = useState(false)
  const [instagramCardMessage, setInstagramCardMessage] = useState('')
  const [instagramCardSubmitting, setInstagramCardSubmitting] = useState(false)
  const [instagramEditingCardId, setInstagramEditingCardId] = useState<string | null>(null)
  
  // 인스타그램 엑셀 다운로드 관련 상태
  const [instagramExcelData, setInstagramExcelData] = useState<any[]>([])
  const [instagramExcelLoading, setInstagramExcelLoading] = useState(false)
  const [instagramExcelMessage, setInstagramExcelMessage] = useState('')
  // const [editingUser, setEditingUser] = useState<string | null>(null) // 사용하지 않음
  const [userMessage, setUserMessage] = useState('')
  const [applications, setApplications] = useState<Application[]>([])
  const [applicationStats, setApplicationStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [applicationFilter, setApplicationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [allExperiences, setAllExperiences] = useState<Experience[]>([])
  const [experiencesLoading, setExperiencesLoading] = useState(false)
  
  // 엑셀 다운로드 관련 상태
  const [excelData, setExcelData] = useState<{[key: string]: string | number | undefined}[]>([])
  const [excelLoading, setExcelLoading] = useState(false)
  const [excelMessage, setExcelMessage] = useState('')
  const [experienceMessage, setExperienceMessage] = useState('')
  const [experienceApplicationCounts, setExperienceApplicationCounts] = useState<{[key: string]: number}>({})

  // 날짜에 따른 상태 자동 계산 함수
  const getStatusByDate = (experience: Experience) => {
    if (!experience.recruitmentStartDate || !experience.recruitmentEndDate) {
      return 'recruiting' // 기본값으로 모집중 반환
    }
    
    const today = new Date()
    const startDate = new Date(experience.recruitmentStartDate)
    const endDate = new Date(experience.recruitmentEndDate)
    
    // 모집 시작 전
    if (today < startDate) {
      return 'recruiting'
    }
    // 모집 기간 중
    else if (today >= startDate && today <= endDate) {
      return 'recruiting'
    }
    // 모집 마감 후 (체험 일정 전)
    else if (today > endDate) {
      // 체험 일정이 있다면 체험 일정 기준으로 판단
      if (experience.date) {
        const experienceDate = new Date(experience.date)
        if (today < experienceDate) {
          return 'ongoing' // 모집 마감, 체험 전
        } else {
          return 'completed' // 체험 완료
        }
      }
      return 'ongoing' // 체험 일정이 없으면 진행중
    }
    
    return 'recruiting' // 기본값
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (!adminLoading && isAuthenticated && !isAdmin) {
      router.push('/')
      return
    }
  }, [isAuthenticated, loading, adminLoading, isAdmin, router])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const result = await getAllUsers()
      if (result.success) {
        setUsers(result.users || [])
      }
    } catch {
      console.error('사용자 목록 로딩 오류')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  const loadUserStats = useCallback(async () => {
    try {
      const result = await getUserStats()
      if (result.success) {
        setUserStats(result.stats || { totalUsers: 0, todayUsers: 0, thisWeekUsers: 0 })
      }
    } catch {
      console.error('사용자 통계 로딩 오류')
    }
  }, [])

  const loadExperienceData = useCallback(async () => {
    try {
      console.log('=== 체험단 데이터 로딩 시작 ===')
      
      // 체험단 통계 로드
      const statsResult = await getExperienceStats()
      if (statsResult.success) {
        setExperienceStats(statsResult.stats || { total: 0, recruiting: 0, ongoing: 0, completed: 0 })
        console.log('체험단 통계 로드 완료:', statsResult.stats)
      } else {
        console.error('체험단 통계 로드 실패:', statsResult.error)
        setExperienceStats({ total: 0, recruiting: 0, ongoing: 0, completed: 0 })
      }
      
      // 최근 체험단 로드
      console.log('최근 체험단 로딩 시작...')
      const recentResult = await getRecentExperiences()
      if (recentResult.success) {
        setRecentExperiences(recentResult.experiences || [])
        console.log('최근 체험단 로드 완료:', recentResult.experiences?.length, '개')
      } else {
        console.error('최근 체험단 로드 실패:', recentResult.error)
        setRecentExperiences([])
      }
      
      // 오늘 방문 체험단 로드
      console.log('오늘 방문 체험단 로딩 시작...')
      const todayResult = await getTodayExperiences()
      if (todayResult.success) {
        setTodayExperiences(todayResult.experiences || [])
        console.log('오늘 방문 체험단 로드 완료:', todayResult.experiences?.length, '개')
      } else {
        console.error('오늘 방문 체험단 로드 실패:', todayResult.error)
        setTodayExperiences([])
      }
      
      // 신청인원 데이터도 함께 로드
      setTimeout(async () => {
        try {
          console.log('대시보드용 신청인원 로딩 시작...')
          const { doc, getDoc } = await import('firebase/firestore')
          const { db } = await import('@/lib/firebase')
          const counts: {[key: string]: number} = {}
          
          // 최근 체험단과 오늘 방문 체험단의 신청인원 로드
          const allDashboardExperiences = [
            ...(recentResult.success ? recentResult.experiences || [] : []),
            ...(todayResult.success ? todayResult.experiences || [] : [])
          ]
          
          for (const experience of allDashboardExperiences) {
            try {
              const experienceRef = doc(db, 'experiences', experience.id)
              const experienceDoc = await getDoc(experienceRef)
              
              if (experienceDoc.exists()) {
                const data = experienceDoc.data()
                const applications = data.applications || []
                counts[experience.id] = applications.length
                console.log(`대시보드 체험단 ${experience.id} 신청인원:`, applications.length)
              } else {
                counts[experience.id] = 0
              }
            } catch (expError) {
              console.error(`대시보드 체험단 ${experience.id} 로딩 오류:`, expError)
              counts[experience.id] = 0
            }
          }
          
          console.log('대시보드 신청인원 데이터:', counts)
          setExperienceApplicationCounts(prev => ({ ...prev, ...counts as Record<string, number> }))
        } catch (error: unknown) {
          console.error('대시보드 신청인원 로딩 오류:', error)
        }
      }, 1000)
    } catch (error: unknown) {
      console.error('체험단 데이터 로딩 오류:', error)
      setExperienceStats({ total: 0, recruiting: 0, ongoing: 0, completed: 0 })
      setRecentExperiences([])
      setTodayExperiences([])
    }
  }, [])

  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true)
    try {
      console.log('=== 샤오홍슈 신청 데이터 로딩 시작 ===')
      const result = await getAllApplications()
      console.log('신청 데이터 로딩 결과:', result)
      if (result.success) {
        console.log('전체 신청서 목록:', result.applications?.map(app => ({
          experienceId: app.experienceId,
          experienceTitle: app.experienceTitle,
          collectionSource: (app as Application & { collectionSource?: string }).collectionSource
        })))
        
        // 샤오홍슈 체험단 신청서만 필터링
        const xiaohongshuApplications = result.applications?.filter(app => {
          const isXiaohongshu = (app as Application & { collectionSource?: string }).collectionSource === 'experiences'
          console.log('신청서 필터링 확인:', {
            experienceId: app.experienceId,
            experienceTitle: app.experienceTitle,
            collectionSource: (app as Application & { collectionSource?: string }).collectionSource,
            willInclude: isXiaohongshu
          })
          return isXiaohongshu
        }) || []
        
        console.log('샤오홍슈 신청 데이터 수:', xiaohongshuApplications.length)
        console.log('샤오홍슈 신청서 목록:', xiaohongshuApplications.map(app => ({
          experienceId: app.experienceId,
          experienceTitle: app.experienceTitle,
          collectionSource: (app as any).collectionSource
        })))
        setApplications(xiaohongshuApplications)
      } else {
        console.error('신청 데이터 로딩 실패:', result.error)
      }
    } catch (error) {
      console.error('신청서 목록 로딩 오류:', error)
    } finally {
      setApplicationsLoading(false)
    }
  }, [])

  const loadApplicationStats = useCallback(async () => {
    try {
      const result = await getAllApplications()
      if (result.success) {
        // 샤오홍슈 체험단 신청서만 필터링하여 통계 계산
        const xiaohongshuApplications = result.applications?.filter(app => {
          return (app as any).collectionSource === 'experiences'
        }) || []
        
        const stats = {
          total: xiaohongshuApplications.length,
          pending: xiaohongshuApplications.filter(app => app.status === 'pending').length,
          approved: xiaohongshuApplications.filter(app => app.status === 'approved').length,
          rejected: xiaohongshuApplications.filter(app => app.status === 'rejected').length
        }
        
        console.log('샤오홍슈 신청 통계:', stats)
        setApplicationStats(stats)
      }
    } catch {
      console.error('신청 통계 로딩 오류')
    }
  }, [])

  const loadAllExperiences = useCallback(async () => {
    setExperiencesLoading(true)
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const experiencesRef = collection(db, 'experiences')
      const q = query(experiencesRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const experiencesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Experience[]
      
      setAllExperiences(experiencesData)
    } catch {
      console.error('체험단 목록 로딩 오류')
    } finally {
      setExperiencesLoading(false)
    }
  }, [])

  // 체험단 상태 수정
  const handleExperienceStatusUpdate = useCallback(async (experienceId: string, newStatus: 'recruiting' | 'ongoing' | 'completed') => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const experienceRef = doc(db, 'experiences', experienceId)
      await updateDoc(experienceRef, {
        status: newStatus,
        updatedAt: new Date()
      })
      
      setExperienceMessage('체험단 상태가 성공적으로 업데이트되었습니다.')
      loadAllExperiences() // 데이터 새로고침
    } catch {
      console.error('체험단 상태 업데이트 오류')
      setExperienceMessage('체험단 상태 업데이트에 실패했습니다.')
    }
  }, [loadAllExperiences])

  // 체험단 삭제
  const handleExperienceDelete = useCallback(async (experienceId: string, experienceTitle: string) => {
    if (!confirm(`"${experienceTitle}" 체험단을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return
    }
    
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const experienceRef = doc(db, 'experiences', experienceId)
      await deleteDoc(experienceRef)
      
      setExperienceMessage('체험단이 성공적으로 삭제되었습니다.')
      loadAllExperiences() // 데이터 새로고침
    } catch {
      console.error('체험단 삭제 오류')
      setExperienceMessage('체험단 삭제에 실패했습니다.')
    }
  }, [])

  // 엑셀 다운로드 데이터 로드
  const loadExcelData = useCallback(async () => {
    try {
      setExcelLoading(true)
      setExcelMessage('')
      
      // 모든 신청 데이터와 체험단 데이터를 가져옴
      const [applicationsData, experiencesData] = await Promise.all([
        getAllApplications(),
        getRecentExperiences()
      ])
      
      // 엑셀용 데이터 변환
      const excelData = applicationsData.applications?.map(app => {
        const experience = experiencesData.experiences?.find(exp => exp.id === app.experienceId)
        return {
          '신청 ID': app.id,
          '신청자 이름': app.name,
          '체험단 제목': app.experienceTitle,
          '여권번호': app.passportNumber,
          '체험단 카테고리': experience?.category || '-',
          '체험 일정': experience?.date || '-',
          '체험 장소': experience?.location || '-',
          '신청 상태': app.status === 'pending' ? '대기중' : 
                     app.status === 'approved' ? '승인' : 
                     app.status === 'rejected' ? '거절' : app.status,
          '신청 일시': app.createdAt ? (app.createdAt instanceof Date ? app.createdAt.toLocaleString('ko-KR') : new Date(app.createdAt).toLocaleString('ko-KR')) : '날짜 없음',
          '처리 일시': app.updatedAt ? (app.updatedAt instanceof Date ? app.updatedAt.toLocaleString('ko-KR') : new Date(app.updatedAt).toLocaleString('ko-KR')) : '날짜 없음',
          '방문 날짜': app.visitDate,
          '방문 시간': app.visitTime,
          '방문 횟수': app.visitCount,
          '위챗 ID': app.wechatId,
          '소홍서 ID': app.xiaohongshuId,
          '팔로워 수': app.followerCount
        }
      })
      
      setExcelData(excelData || [])
      setExcelMessage(`총 ${excelData?.length || 0}개의 신청 데이터를 로드했습니다.`)
    } catch (error) {
      console.error('엑셀 데이터 로드 오류:', error)
      setExcelMessage('데이터 로드에 실패했습니다.')
    } finally {
      setExcelLoading(false)
    }
  }, [])

  // 엑셀 다운로드 실행
  const handleExcelDownload = useCallback(async () => {
    try {
      const XLSX = await import('xlsx')
      
      if (excelData.length === 0) {
        setExcelMessage('다운로드할 데이터가 없습니다. 먼저 데이터를 로드해주세요.')
        return
      }
      
      // 워크시트 생성
      const ws = XLSX.utils.json_to_sheet(excelData)
      
      // 컬럼 너비 설정
      const colWidths = [
        { wch: 15 }, // 신청 ID
        { wch: 12 }, // 신청자 이름
        { wch: 25 }, // 신청자 이메일
        { wch: 15 }, // 신청자 전화번호
        { wch: 30 }, // 체험단 제목
        { wch: 15 }, // 체험단 카테고리
        { wch: 15 }, // 체험 일정
        { wch: 20 }, // 체험 장소
        { wch: 10 }, // 신청 상태
        { wch: 20 }, // 신청 일시
        { wch: 20 }, // 처리 일시
        { wch: 30 }, // 신청 동기
        { wch: 30 }, // 경험 및 관심사
        { wch: 30 }  // 추가 정보
      ]
      ws['!cols'] = colWidths
      
      // 워크북 생성
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '체험단 신청리스트')
      
      // 파일명 생성 (현재 날짜 포함)
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
      const fileName = `체험단신청리스트_${dateStr}.xlsx`
      
      // 파일 다운로드
      XLSX.writeFile(wb, fileName)
      
      setExcelMessage('엑셀 파일이 성공적으로 다운로드되었습니다!')
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error)
      setExcelMessage('엑셀 다운로드에 실패했습니다.')
    }
  }, [excelData])

  // 카드 생성/수정 핸들러
  const handleCardSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 인증 상태 확인
    const { auth } = await import('@/lib/firebase')
    
    console.log('=== 카드 생성/수정 시작 ===')
    console.log('현재 인증 상태 확인 중...')
    console.log('수정 모드:', editingCardId ? '수정' : '생성')
    
    // 인증 상태 확인
    const user = auth.currentUser
    console.log('현재 사용자:', user ? {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    } : '로그인되지 않음')
    
    if (!user) {
      setCardMessage('로그인이 필요합니다. 다시 로그인해주세요.')
      return
    }
    
    // 필수 필드 검증
    if (!cardForm.activityType || !cardForm.title || !cardForm.titleZh || !cardForm.category || 
        !cardForm.description || !cardForm.descriptionZh || !cardForm.maxParticipants || 
        !cardForm.experienceStartDate || !cardForm.experienceEndDate || !cardForm.recruitmentStartDate || !cardForm.recruitmentEndDate ||
        !cardForm.location || !cardForm.locationZh) {
      setCardMessage('모든 필수 필드를 입력해주세요.')
      return
    }
    
    try {
      setCardSubmitting(true)
      setCardMessage('')
      
      const { collection, addDoc, Timestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const { uploadImage } = await import('@/lib/imageService')
      
      
      // 카테고리 결정 (기타인 경우 커스텀 카테고리 사용)
      const finalCategory = cardForm.category === 'other' ? cardForm.customCategory : cardForm.category
      
      // 모집 마감일까지 남은 일수 계산
      const today = new Date()
      const endDate = new Date(cardForm.recruitmentEndDate)
      const diffTime = endDate.getTime() - today.getTime()
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // 이미지 업로드 처리
      let imageUrl = editingCardId ? cardForm.imagePreview : '/api/placeholder/300/200' // 수정 모드에서는 기존 이미지 유지
      let allImageUrls: string[] = editingCardId ? cardForm.imagePreviews : [] // 수정 모드에서는 기존 이미지들 유지
      
      if (cardForm.images.length > 0) {
        console.log('=== 여러 이미지 업로드 시작 ===')
        console.log('업로드할 이미지 수:', cardForm.images.length)
        
        const timestamp = Date.now()
        const uploadPromises = cardForm.images.map(async (imageFile, index) => {
          const fileName = `experience_${timestamp}_${index}_${imageFile.name}`
          const storagePath = `images/${fileName}`
          console.log(`이미지 ${index + 1} 업로드 중:`, storagePath)
          
          const uploadResult = await uploadImage(imageFile, storagePath)
          if (uploadResult.success && uploadResult.url) {
            console.log(`✅ 이미지 ${index + 1} 업로드 성공:`, uploadResult.url)
            return uploadResult.url
          } else {
            console.error(`❌ 이미지 ${index + 1} 업로드 실패:`, uploadResult.error)
            return null
          }
        })
        
        try {
          const uploadResults = await Promise.all(uploadPromises)
          const newImageUrls = uploadResults.filter(url => url !== null) as string[]
          
          if (newImageUrls.length > 0) {
            // 수정 모드에서는 새 이미지만 사용 (기존 이미지 교체)
            if (editingCardId) {
              allImageUrls = newImageUrls // 기존 이미지 제거하고 새 이미지만 사용
              imageUrl = newImageUrls[0] // 새 이미지의 첫 번째를 메인 이미지로
            } else {
              allImageUrls = newImageUrls
              imageUrl = allImageUrls[0] // 첫 번째 이미지를 메인 이미지로 사용
            }
            console.log('✅ 모든 이미지 업로드 완료:', allImageUrls)
            setCardMessage(`${newImageUrls.length}개의 새 이미지가 성공적으로 업로드되었습니다!`)
          } else {
            console.error('❌ 모든 이미지 업로드 실패')
            setCardMessage('이미지 업로드에 실패했습니다. 기존 이미지를 유지합니다.')
          }
        } catch (error) {
          console.error('❌ 이미지 업로드 예외:', error)
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          setCardMessage(`이미지 업로드 중 오류가 발생했습니다: ${errorMessage}`)
        }
      } else if (cardForm.image) {
        // 단일 이미지 처리 (기존 로직)
        console.log('=== 단일 이미지 업로드 시작 ===')
        const timestamp = Date.now()
        const fileName = `experience_${timestamp}_${cardForm.image.name}`
        const storagePath = `images/${fileName}`
        
        try {
          const uploadResult = await uploadImage(cardForm.image, storagePath)
          if (uploadResult.success && uploadResult.url) {
            // 수정 모드에서는 새 이미지만 사용 (기존 이미지 교체)
            if (editingCardId) {
              allImageUrls = [uploadResult.url] // 기존 이미지 제거하고 새 이미지만 사용
              imageUrl = uploadResult.url
            } else {
              allImageUrls = [uploadResult.url]
              imageUrl = uploadResult.url
            }
            console.log('✅ 단일 이미지 업로드 성공:', uploadResult.url)
            setCardMessage('이미지가 성공적으로 업로드되었습니다!')
          } else {
            console.error('❌ 단일 이미지 업로드 실패:', uploadResult.error)
            setCardMessage('이미지 업로드에 실패했습니다. 기존 이미지를 유지합니다.')
          }
        } catch (error) {
          console.error('❌ 단일 이미지 업로드 예외:', error)
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
          setCardMessage(`이미지 업로드 중 오류가 발생했습니다: ${errorMessage}`)
        }
      } else {
        console.log('이미지가 선택되지 않음, 기존 이미지 유지')
        if (editingCardId) {
          console.log('수정 모드: 기존 이미지 유지')
          // 수정 모드에서 새 이미지가 없으면 기존 이미지 유지
          imageUrl = cardForm.imagePreview || '/api/placeholder/300/200'
          allImageUrls = cardForm.imagePreviews || []
        } else {
          console.log('생성 모드: 기본 이미지 사용')
        }
      }
      
      console.log('=== 최종 이미지 정보 ===')
      console.log('메인 이미지 (image):', imageUrl)
      console.log('모든 이미지 (images):', allImageUrls)
      console.log('수정 모드:', editingCardId ? '수정' : '생성')
      
      const newExperience = {
        activityType: cardForm.activityType,
        title: cardForm.title,
        titleZh: cardForm.titleZh,
        description: cardForm.description,
        descriptionZh: cardForm.descriptionZh,
        category: finalCategory,
        maxParticipants: parseInt(cardForm.maxParticipants),
        participants: 0,
        daysLeft: Math.max(0, daysLeft), // 올바른 일수 계산
        image: imageUrl, // 첫 번째 이미지 (카드용)
        images: allImageUrls, // 모든 이미지 (상세 페이지용)
        isNew: false,
        status: 'recruiting',
        recruitmentStartDate: cardForm.recruitmentStartDate,
        recruitmentEndDate: cardForm.recruitmentEndDate,
        startDate: cardForm.experienceStartDate,
        endDate: cardForm.experienceEndDate,
        location: cardForm.location,
        locationZh: cardForm.locationZh,
        tags: cardForm.tags.filter(t => t.trim() !== ''),
        tagsZh: cardForm.tagsZh.filter(t => t.trim() !== ''),
        benefits: cardForm.benefits.filter(b => b.trim() !== ''),
        benefitsZh: cardForm.benefitsZh.filter(b => b.trim() !== ''),
        requirements: cardForm.requirements.filter(r => r.trim() !== ''),
        requirementsZh: cardForm.requirementsZh.filter(r => r.trim() !== ''),
        contact: 'support@naver.com',
        applications: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
      
      if (editingCardId) {
        // 수정 모드
        const { doc, updateDoc } = await import('firebase/firestore')
        const experienceRef = doc(db, 'experiences', editingCardId)
        await updateDoc(experienceRef, {
          ...newExperience,
          updatedAt: Timestamp.now()
        })
        setCardMessage('체험단 카드가 성공적으로 수정되었습니다!')
        setEditingCardId(null)
      } else {
        // 생성 모드
        const experiencesRef = collection(db, 'experiences')
        const docRef = await addDoc(experiencesRef, newExperience)
        setCardMessage('체험단 카드가 성공적으로 생성되었습니다!')
      }
      
      // 폼 초기화 (수정 완료 후에만)
      if (!editingCardId) {
        setCardForm({
          activityType: '',
          title: '',
          titleEn: '',
          titleZh: '',
          category: '',
          customCategory: '',
          description: '',
          descriptionEn: '',
          descriptionZh: '',
          maxParticipants: '',
          experienceStartDate: '',
          experienceEndDate: '',
          recruitmentStartDate: '',
          recruitmentEndDate: '',
          location: '',
          locationEn: '',
          locationZh: '',
          benefits: [''],
          benefitsEn: [''],
          benefitsZh: [''],
          requirements: [''],
          requirementsEn: [''],
          requirementsZh: [''],
          tags: [''],
          tagsEn: [''],
          tagsZh: [''],
          image: null,
          imagePreview: '',
          images: [],
          imagePreviews: [] as string[]
        })
      }
      setShowCustomCategory(false)
      
      // 체험단 목록 새로고침
      loadAllExperiences()
      
    } catch {
      console.error('카드 생성 오류')
      setCardMessage('카드 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setCardSubmitting(false)
    }
  }, [cardForm, loadAllExperiences, editingCardId])

  // 카드 수정 핸들러
  const handleEditCard = useCallback((experience: Experience) => {
    // 카드 수정 모드로 전환
    setEditingCardId(experience.id)
    setCardForm({
      activityType: experience.activityType || '',
      title: experience.title,
      titleEn: experience.titleEn || '',
      titleZh: experience.titleZh || '',
      category: experience.category,
      customCategory: '',
      description: experience.description,
      descriptionEn: experience.descriptionEn || '',
      descriptionZh: experience.descriptionZh || '',
      maxParticipants: experience.maxParticipants.toString(),
      experienceStartDate: experience.startDate ? (experience.startDate instanceof Date ? experience.startDate.toISOString().split('T')[0] : experience.startDate) : '',
      experienceEndDate: experience.endDate ? (experience.endDate instanceof Date ? experience.endDate.toISOString().split('T')[0] : experience.endDate) : '',
      recruitmentStartDate: experience.recruitmentStartDate || '',
      recruitmentEndDate: experience.recruitmentEndDate || '',
      location: experience.location || '',
      locationEn: experience.locationEn || '',
      locationZh: experience.locationZh || '',
      tags: Array.isArray(experience.tags) && experience.tags.length > 0 ? experience.tags : [''],
      tagsEn: Array.isArray(experience.tagsEn) && experience.tagsEn.length > 0 ? experience.tagsEn : [''],
      tagsZh: Array.isArray(experience.tagsZh) && experience.tagsZh.length > 0 ? experience.tagsZh : [''],
      benefits: Array.isArray(experience.benefits) && experience.benefits.length > 0 ? experience.benefits : [''],
      benefitsEn: Array.isArray(experience.benefitsEn) && experience.benefitsEn.length > 0 ? experience.benefitsEn : [''],
      benefitsZh: Array.isArray(experience.benefitsZh) && experience.benefitsZh.length > 0 ? experience.benefitsZh : [''],
      requirements: Array.isArray(experience.requirements) && experience.requirements.length > 0 ? experience.requirements : [''],
      requirementsEn: Array.isArray(experience.requirementsEn) && experience.requirementsEn.length > 0 ? experience.requirementsEn : [''],
      requirementsZh: Array.isArray(experience.requirementsZh) && experience.requirementsZh.length > 0 ? experience.requirementsZh : [''],
      image: null,
      imagePreview: experience.image || '',
      images: [],
      imagePreviews: Array.isArray(experience.images) ? experience.images : []
    })
    setActiveTab('create-card')
    setCardMessage('카드 수정 모드입니다. 내용을 수정하고 저장하세요.')
  }, [])

  // 카드 삭제 핸들러
  const handleDeleteCard = useCallback(async (experienceId: string) => {
    if (!confirm('정말로 이 카드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      await deleteDoc(doc(db, 'experiences', experienceId))
      setCardMessage('카드가 성공적으로 삭제되었습니다.')
      
      // 체험단 목록 새로고침
      loadAllExperiences()
    } catch (error) {
      console.error('카드 삭제 오류:', error)
      setCardMessage('카드 삭제에 실패했습니다.')
    }
  }, [])

  // 태그 추가/삭제
  const addTag = useCallback(() => {
    setCardForm(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }))
  }, [])

  const removeTag = useCallback((index: number) => {
    setCardForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }, [])

  const updateTag = useCallback((index: number, value: string) => {
    setCardForm(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }))
  }, [])

  const addTagZh = useCallback(() => {
    setCardForm(prev => ({
      ...prev,
      tagsZh: [...prev.tagsZh, '']
    }))
  }, [])

  const removeTagZh = useCallback((index: number) => {
    setCardForm(prev => ({
      ...prev,
      tagsZh: prev.tagsZh.filter((_, i) => i !== index)
    }))
  }, [])

  const updateTagZh = useCallback((index: number, value: string) => {
    setCardForm(prev => ({
      ...prev,
      tagsZh: prev.tagsZh.map((tag, i) => i === index ? value : tag)
    }))
  }, [])

  // 혜택 추가/삭제
  const addBenefit = useCallback(() => {
    setCardForm(prev => ({
      ...prev,
      benefits: [...prev.benefits, '']
    }))
  }, [])

  const removeBenefit = useCallback((index: number) => {
    setCardForm(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }))
  }, [])

  const updateBenefit = useCallback((index: number, value: string) => {
    setCardForm(prev => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => i === index ? value : benefit)
    }))
  }, [])

  // 조건 추가/삭제
  const addRequirement = useCallback(() => {
    setCardForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }))
  }, [])

  const removeRequirement = useCallback((index: number) => {
    setCardForm(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }, [])

  const updateRequirement = useCallback((index: number, value: string) => {
    setCardForm(prev => ({
      ...prev,
      requirements: prev.requirements.map((requirement, i) => i === index ? value : requirement)
    }))
  }, [])

  // 중국어 혜택 추가/삭제/수정
  const addBenefitZh = useCallback(() => {
    setCardForm(prev => ({
      ...prev,
      benefitsZh: [...prev.benefitsZh, '']
    }))
  }, [])

  const removeBenefitZh = useCallback((index: number) => {
    setCardForm(prev => ({
      ...prev,
      benefitsZh: prev.benefitsZh.filter((_, i) => i !== index)
    }))
  }, [])

  const updateBenefitZh = useCallback((index: number, value: string) => {
    setCardForm(prev => ({
      ...prev,
      benefitsZh: prev.benefitsZh.map((benefit, i) => i === index ? value : benefit)
    }))
  }, [])

  // 중국어 조건 추가/삭제/수정
  const addRequirementZh = useCallback(() => {
    setCardForm(prev => ({
      ...prev,
      requirementsZh: [...prev.requirementsZh, '']
    }))
  }, [])

  const removeRequirementZh = useCallback((index: number) => {
    setCardForm(prev => ({
      ...prev,
      requirementsZh: prev.requirementsZh.filter((_, i) => i !== index)
    }))
  }, [])

  const updateRequirementZh = useCallback((index: number, value: string) => {
    setCardForm(prev => ({
      ...prev,
      requirementsZh: prev.requirementsZh.map((requirement, i) => i === index ? value : requirement)
    }))
  }, [])

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCardForm(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }))
    }
  }, [])

  // 이미지 제거 핸들러
  const handleImageRemove = useCallback(() => {
    if (cardForm.imagePreview) {
      URL.revokeObjectURL(cardForm.imagePreview)
    }
    setCardForm(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }))
  }, [cardForm.imagePreview])

  // 여러 이미지 업로드 핸들러
  const handleMultipleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file))
      
      setCardForm(prev => ({
        ...prev,
        images: [...prev.images, ...files],
        imagePreviews: [...prev.imagePreviews, ...newPreviews],
        // 첫 번째 이미지는 메인 이미지로도 설정
        image: prev.image || files[0],
        imagePreview: prev.imagePreview || newPreviews[0]
      }))
    }
  }, [])

  // 개별 이미지 제거 핸들러
  const handleImageRemoveAt = useCallback((index: number) => {
    setCardForm(prev => {
      const newImages = [...prev.images]
      const newPreviews = [...prev.imagePreviews]
      
      // URL 해제
      URL.revokeObjectURL(newPreviews[index])
      
      // 배열에서 제거
      newImages.splice(index, 1)
      newPreviews.splice(index, 1)
      
      // 메인 이미지가 제거된 경우 첫 번째 이미지로 변경
      let newMainImage = prev.image
      let newMainPreview = prev.imagePreview
      
      if (index === 0 && newImages.length > 0) {
        newMainImage = newImages[0]
        newMainPreview = newPreviews[0]
      } else if (newImages.length === 0) {
        newMainImage = null
        newMainPreview = ''
      }
      
      return {
        ...prev,
        images: newImages,
        imagePreviews: newPreviews,
        image: newMainImage,
        imagePreview: newMainPreview
      }
    })
  }, [])

  // 모든 이미지 제거 핸들러
  const handleAllImagesRemove = useCallback(() => {
    // 모든 미리보기 URL 해제
    cardForm.imagePreviews.forEach(url => URL.revokeObjectURL(url))
    if (cardForm.imagePreview) {
      URL.revokeObjectURL(cardForm.imagePreview)
    }
    
    setCardForm(prev => ({
      ...prev,
      images: [],
      imagePreviews: [],
      image: null,
      imagePreview: ''
    }))
  }, [cardForm.imagePreviews, cardForm.imagePreview])

  // 체험단별 신청인원 가져오기
  const loadExperienceApplicationCounts = useCallback(async () => {
    try {
      console.log('신청인원 로딩 시작, 체험단 수:', allExperiences.length)
      const { doc, getDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const counts: {[key: string]: number} = {}
      
      // 모든 체험단 (allExperiences)에 대한 신청인원 로드
      for (const experience of allExperiences) {
        console.log(`체험단 ${experience.id} 신청인원 로딩 중...`)
        try {
          const experienceRef = doc(db, 'experiences', experience.id)
          const experienceDoc = await getDoc(experienceRef)
          
          if (experienceDoc.exists()) {
            const data = experienceDoc.data()
            const applications = data.applications || []
            counts[experience.id] = applications.length
            console.log(`체험단 ${experience.id} 신청인원:`, applications.length)
          } else {
            counts[experience.id] = 0
            console.log(`체험단 ${experience.id} 문서가 존재하지 않음`)
          }
        } catch (expError) {
          console.error(`체험단 ${experience.id} 로딩 오류:`, expError)
          counts[experience.id] = 0
        }
      }
      
      // 최근 체험단에 대한 신청인원도 로드
      for (const experience of recentExperiences) {
        if (!counts[experience.id]) {
          console.log(`최근 체험단 ${experience.id} 신청인원 로딩 중...`)
          try {
            const experienceRef = doc(db, 'experiences', experience.id)
            const experienceDoc = await getDoc(experienceRef)
            
            if (experienceDoc.exists()) {
              const data = experienceDoc.data()
              const applications = data.applications || []
              counts[experience.id] = applications.length
              console.log(`최근 체험단 ${experience.id} 신청인원:`, applications.length)
            } else {
              counts[experience.id] = 0
            }
          } catch (expError) {
            console.error(`최근 체험단 ${experience.id} 로딩 오류:`, expError)
            counts[experience.id] = 0
          }
        }
      }
      
      // 오늘 방문 체험단에 대한 신청인원도 로드
      for (const experience of todayExperiences) {
        if (!counts[experience.id]) {
          console.log(`오늘 방문 체험단 ${experience.id} 신청인원 로딩 중...`)
          try {
            const experienceRef = doc(db, 'experiences', experience.id)
            const experienceDoc = await getDoc(experienceRef)
            
            if (experienceDoc.exists()) {
              const data = experienceDoc.data()
              const applications = data.applications || []
              counts[experience.id] = applications.length
              console.log(`오늘 방문 체험단 ${experience.id} 신청인원:`, applications.length)
            } else {
              counts[experience.id] = 0
            }
          } catch (expError) {
            console.error(`오늘 방문 체험단 ${experience.id} 로딩 오류:`, expError)
            counts[experience.id] = 0
          }
        }
      }
      
      console.log('최종 신청인원 데이터:', counts)
      setExperienceApplicationCounts(counts)
    } catch {
      console.error('체험단 신청인원 로딩 오류')
      // 오류 발생 시 기본값 설정
      const defaultCounts: {[key: string]: number} = {}
      allExperiences.forEach(exp => {
        defaultCounts[exp.id] = 0
      })
      setExperienceApplicationCounts(defaultCounts)
    }
  }, [allExperiences])

  const handleApplicationStatusUpdate = useCallback(async (applicationId: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      setApplicationMessage('')
      const result = await updateApplicationStatus(applicationId, status)
      if (result.success) {
        setApplicationMessage('신청서 상태가 성공적으로 업데이트되었습니다!')
        await loadApplications()
        await loadApplicationStats()
      } else {
        setApplicationMessage('상태 업데이트에 실패했습니다.')
      }
    } catch {
      setApplicationMessage('상태 업데이트 중 오류가 발생했습니다.')
    }
  }, [loadApplications, loadApplicationStats])

  // 승인 취소 핸들러
  const handleCancelApproval = useCallback(async (applicationId: string) => {
    try {
      setApplicationMessage('')
      const result = await cancelApproval(applicationId)
      if (result.success) {
        setApplicationMessage('승인이 취소되었습니다!')
        await loadApplications()
        await loadApplicationStats()
      } else {
        setApplicationMessage('승인 취소에 실패했습니다.')
      }
    } catch {
      setApplicationMessage('승인 취소 중 오류가 발생했습니다.')
    }
  }, [loadApplications, loadApplicationStats])

  // 거부 취소 핸들러
  const handleCancelRejection = useCallback(async (applicationId: string) => {
    try {
      setApplicationMessage('')
      const result = await cancelRejection(applicationId)
      if (result.success) {
        setApplicationMessage('거부가 취소되었습니다!')
        await loadApplications()
        await loadApplicationStats()
      } else {
        setApplicationMessage('거부 취소에 실패했습니다.')
      }
    } catch {
      setApplicationMessage('거부 취소 중 오류가 발생했습니다.')
    }
  }, [loadApplications, loadApplicationStats])

  const handleApplicationDelete = useCallback(async (applicationId: string, applicantName: string) => {
    if (confirm(`${applicantName}의 신청서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        setApplicationMessage('')
        const result = await deleteApplication(applicationId)
        if (result.success) {
          setApplicationMessage('신청서가 성공적으로 삭제되었습니다!')
          await loadApplications()
          await loadApplicationStats()
        } else {
          setApplicationMessage('신청서 삭제에 실패했습니다.')
        }
      } catch {
        setApplicationMessage('신청서 삭제 중 오류가 발생했습니다.')
      }
    }
  }, [loadApplications, loadApplicationStats])

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      setUserMessage('')
      const result = await updateUserRole(userId, newRole)
      if (result.success) {
        setUserMessage('사용자 역할이 성공적으로 업데이트되었습니다!')
        await loadUsers() // 사용자 목록 새로고침
        // setEditingUser(null) // 사용하지 않음
      } else {
        setUserMessage('역할 업데이트에 실패했습니다.')
      }
    } catch {
      setUserMessage('역할 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleUserDelete = async (userId: string, userName: string) => {
    if (confirm(`${userName} 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      try {
        setUserMessage('')
        const result = await deleteUser(userId)
        if (result.success) {
          setUserMessage('사용자가 성공적으로 삭제되었습니다!')
          await loadUsers() // 사용자 목록 새로고침
        } else {
          setUserMessage('사용자 삭제에 실패했습니다.')
        }
      } catch {
        setUserMessage('사용자 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleSeedData = async () => {
    try {
      const result = await seedExperiences()
      if (result.success) {
        console.log('체험단 데이터가 성공적으로 저장되었습니다!')
      } else {
        console.log('데이터 저장 중 오류가 발생했습니다.')
      }
    } catch {
      console.log('데이터 저장 중 오류가 발생했습니다.')
    }
  }

  const handleResetData = async () => {
    try {
      const result = await resetExperiences()
      if (result.success) {
        console.log('체험단 데이터가 초기화되었습니다!')
      } else {
        console.log('데이터 초기화 중 오류가 발생했습니다.')
      }
    } catch {
      console.log('데이터 초기화 중 오류가 발생했습니다.')
    }
  }

  // 인스타그램 데이터 로딩
  const loadInstagramData = useCallback(async () => {
    try {
      setInstagramLoading(true)
      console.log('=== 인스타그램 데이터 로딩 시작 ===')
      
      const [recentResult, todayResult, statsResult] = await Promise.all([
        getInstagramRecentExperiences(10),
        getInstagramTodayExperiences(),
        getInstagramExperienceStats()
      ])
      
      if (recentResult.success) {
        setInstagramRecentExperiences(recentResult.experiences || [])
        console.log('인스타그램 최근 체험단 로드 완료:', recentResult.experiences?.length || 0)
      }
      
      if (todayResult.success) {
        setInstagramTodayExperiences(todayResult.experiences || [])
        console.log('인스타그램 오늘 체험단 로드 완료:', todayResult.experiences?.length || 0)
      }
      
      if (statsResult.success && statsResult.stats) {
        setInstagramStats(statsResult.stats)
        console.log('인스타그램 통계 로드 완료:', statsResult.stats)
      }
      
    } catch (error) {
      console.error('인스타그램 데이터 로딩 오류:', error)
    } finally {
      setInstagramLoading(false)
    }
  }, [])

  // 인스타그램 신청 데이터 로딩
  const loadInstagramApplications = useCallback(async () => {
    try {
      setApplicationsLoading(true)
      console.log('=== 인스타그램 신청 데이터 로딩 시작 ===')
      
      const result = await getAllApplications()
      if (result.success) {
        // 인스타그램 체험단 신청서만 필터링 (instagram_experiences 컬렉션에서 온 신청서)
        const instagramApps = result.applications?.filter(app => {
          console.log('인스타그램 신청서 필터링 확인:', {
            experienceId: app.experienceId,
            experienceTitle: app.experienceTitle,
            collectionSource: (app as any).collectionSource,
            willInclude: (app as any).collectionSource === 'instagram_experiences'
          })
          // instagram_experiences 컬렉션에서 온 신청서만 필터링
          return (app as any).collectionSource === 'instagram_experiences'
        }) || []
        
        setInstagramApplications(instagramApps)
        console.log('인스타그램 신청 데이터 로드 완료:', instagramApps.length)
        
        // 통계 계산
        const stats = {
          total: instagramApps.length,
          pending: instagramApps.filter(app => app.status === 'pending').length,
          approved: instagramApps.filter(app => app.status === 'approved').length,
          rejected: instagramApps.filter(app => app.status === 'rejected').length
        }
        setInstagramApplicationStats(stats)
        console.log('인스타그램 신청 통계:', stats)
      }
    } catch (error) {
      console.error('인스타그램 신청 데이터 로딩 오류:', error)
    } finally {
      setApplicationsLoading(false)
    }
  }, [])

  // 인스타그램 사용자 통계 로딩 (인스타그램 체험단 신청자 기준)
  const loadInstagramUserStats = useCallback(async () => {
    try {
      console.log('=== 인스타그램 사용자 통계 로딩 시작 ===')
      
      // 인스타그램 체험단 ID 목록
      const instagramExperienceIds = instagramRecentExperiences.map(exp => exp.id)
      
      if (instagramExperienceIds.length === 0) {
        setInstagramUserStats({ totalUsers: 0, todayUsers: 0, thisWeekUsers: 0 })
        return
      }
      
      // 인스타그램 체험단에 신청한 사용자들만 필터링
      const result = await getAllApplications()
      if (result.success) {
        const instagramApps = result.applications?.filter(app => 
          app.experienceId && instagramExperienceIds.includes(app.experienceId)
        ) || []
        
        // 고유 사용자 추출
        const uniqueUsers = new Set(instagramApps.map(app => app.userId))
        const totalUsers = uniqueUsers.size
        
        // 오늘 신청한 사용자
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const todayApps = instagramApps.filter(app => {
          const appDate = new Date(app.createdAt).toISOString().split('T')[0]
          return appDate === todayStr
        })
        const todayUsers = new Set(todayApps.map(app => app.userId)).size
        
        // 이번 주 신청한 사용자
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay())
        const weekStartStr = weekStart.toISOString().split('T')[0]
        const thisWeekApps = instagramApps.filter(app => {
          const appDate = new Date(app.createdAt).toISOString().split('T')[0]
          return appDate >= weekStartStr
        })
        const thisWeekUsers = new Set(thisWeekApps.map(app => app.userId)).size
        
        const instagramUserStats = {
          totalUsers,
          todayUsers,
          thisWeekUsers
        }
        
        setInstagramUserStats(instagramUserStats)
        console.log('인스타그램 사용자 통계 로드 완료:', instagramUserStats)
      }
    } catch (error) {
      console.error('인스타그램 사용자 통계 로딩 오류:', error)
    }
  }, [instagramRecentExperiences.length])

  // 인스타그램 체험단 신청인원 로딩
  const loadInstagramExperienceApplicationCounts = useCallback(async () => {
    try {
      console.log('=== 인스타그램 체험단 신청인원 로딩 시작 ===')
      
      const counts: Record<string, number> = {}
      
      for (const experience of instagramRecentExperiences) {
        try {
          const { getInstagramApplicationsByExperience } = await import('@/lib/applicationService')
          const result = await getInstagramApplicationsByExperience(experience.id)
          
          if (result.success) {
            counts[experience.id] = result.applications?.length || 0
            console.log(`인스타그램 체험단 ${experience.title} 신청인원:`, counts[experience.id])
          }
        } catch (error) {
          console.error(`인스타그램 체험단 ${experience.id} 신청인원 로딩 오류:`, error)
          counts[experience.id] = 0
        }
      }
      
      setInstagramExperienceApplicationCounts(counts)
      console.log('인스타그램 체험단 신청인원 로드 완료:', counts)
      
    } catch (error) {
      console.error('인스타그램 체험단 신청인원 로딩 오류:', error)
    }
  }, [instagramRecentExperiences.length])

  // 인스타그램 모든 체험단 로딩
  const loadInstagramAllExperiences = useCallback(async () => {
    try {
      setInstagramExperiencesLoading(true)
      console.log('=== 인스타그램 모든 체험단 로딩 시작 ===')
      
      const { collection, getDocs, orderBy, query } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const experiencesRef = collection(db, 'instagram_experiences')
      const q = query(experiencesRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const experiences = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          // 날짜 계산을 위한 daysLeft 추가
          daysLeft: data.date ? Math.ceil((new Date(data.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
        }
      }) as Experience[]
      
      setInstagramAllExperiences(experiences)
      console.log('인스타그램 모든 체험단 로드 완료:', experiences.length)
      
    } catch (error) {
      console.error('인스타그램 모든 체험단 로딩 오류:', error)
    } finally {
      setInstagramExperiencesLoading(false)
    }
  }, [])

  // 인스타그램 체험단 상태 업데이트
  const handleInstagramExperienceStatusUpdate = async (experienceId: string, newStatus: 'recruiting' | 'ongoing' | 'completed') => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const experienceRef = doc(db, 'instagram_experiences', experienceId)
      await updateDoc(experienceRef, { status: newStatus })
      
      setInstagramExperienceMessage('체험단 상태가 성공적으로 업데이트되었습니다.')
      setTimeout(() => setInstagramExperienceMessage(''), 3000)
      
      // 데이터 새로고침
      loadInstagramAllExperiences()
      loadInstagramData()
      
    } catch (error) {
      console.error('인스타그램 체험단 상태 업데이트 오류:', error)
      setInstagramExperienceMessage('체험단 상태 업데이트에 실패했습니다.')
      setTimeout(() => setInstagramExperienceMessage(''), 3000)
    }
  }

  // 인스타그램 체험단 삭제
  const handleInstagramExperienceDelete = async (experienceId: string, experienceTitle: string) => {
    if (!confirm(`"${experienceTitle}" 체험단을 삭제하시겠습니까?`)) {
      return
    }
    
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const experienceRef = doc(db, 'instagram_experiences', experienceId)
      await deleteDoc(experienceRef)
      
      setInstagramExperienceMessage('체험단이 성공적으로 삭제되었습니다.')
      setTimeout(() => setInstagramExperienceMessage(''), 3000)
      
      // 데이터 새로고침
      loadInstagramAllExperiences()
      loadInstagramData()
      
    } catch (error) {
      console.error('인스타그램 체험단 삭제 오류:', error)
      setInstagramExperienceMessage('체험단 삭제에 실패했습니다.')
      setTimeout(() => setInstagramExperienceMessage(''), 3000)
    }
  }

  // 인스타그램 신청 상태 업데이트
  const handleInstagramApplicationStatusUpdate = async (applicationId: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const applicationRef = doc(db, 'applications', applicationId)
      await updateDoc(applicationRef, { status: newStatus })
      
      setInstagramApplicationMessage('신청 상태가 성공적으로 업데이트되었습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
      
      // 데이터 새로고침
      loadInstagramApplications()
      
    } catch (error) {
      console.error('인스타그램 신청 상태 업데이트 오류:', error)
      setInstagramApplicationMessage('신청 상태 업데이트에 실패했습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
    }
  }

  // 인스타그램 신청 승인 취소
  const handleInstagramCancelApproval = async (applicationId: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const applicationRef = doc(db, 'applications', applicationId)
      await updateDoc(applicationRef, { status: 'pending' })
      
      setInstagramApplicationMessage('승인이 취소되었습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
      
      // 데이터 새로고침
      loadInstagramApplications()
      
    } catch (error) {
      console.error('인스타그램 승인 취소 오류:', error)
      setInstagramApplicationMessage('승인 취소에 실패했습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
    }
  }

  // 인스타그램 신청 거부 취소
  const handleInstagramCancelRejection = async (applicationId: string) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const applicationRef = doc(db, 'applications', applicationId)
      await updateDoc(applicationRef, { status: 'pending' })
      
      setInstagramApplicationMessage('거부가 취소되었습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
      
      // 데이터 새로고침
      loadInstagramApplications()
      
    } catch (error) {
      console.error('인스타그램 거부 취소 오류:', error)
      setInstagramApplicationMessage('거부 취소에 실패했습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
    }
  }

  // 인스타그램 신청 삭제
  const handleInstagramApplicationDelete = async (applicationId: string, applicantName: string) => {
    if (!confirm(`"${applicantName}"의 신청을 삭제하시겠습니까?`)) {
      return
    }
    
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const applicationRef = doc(db, 'applications', applicationId)
      await deleteDoc(applicationRef)
      
      setInstagramApplicationMessage('신청이 성공적으로 삭제되었습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
      
      // 데이터 새로고침
      loadInstagramApplications()
      
    } catch (error) {
      console.error('인스타그램 신청 삭제 오류:', error)
      setInstagramApplicationMessage('신청 삭제에 실패했습니다.')
      setTimeout(() => setInstagramApplicationMessage(''), 3000)
    }
  }

  // 인스타그램 카드 폼 관련 함수들
  const updateInstagramBenefit = (index: number, value: string) => {
    const newBenefits = [...instagramCardForm.benefits]
    newBenefits[index] = value
    setInstagramCardForm({...instagramCardForm, benefits: newBenefits})
  }

  // 인스타그램 태그 추가/삭제
  const addInstagramTag = () => {
    setInstagramCardForm({...instagramCardForm, tags: [...instagramCardForm.tags, '']})
  }

  const removeInstagramTag = (index: number) => {
    const newTags = instagramCardForm.tags.filter((_, i) => i !== index)
    setInstagramCardForm({...instagramCardForm, tags: newTags})
  }

  const updateInstagramTag = (index: number, value: string) => {
    const newTags = [...instagramCardForm.tags]
    newTags[index] = value
    setInstagramCardForm({...instagramCardForm, tags: newTags})
  }

  const addInstagramTagEn = () => {
    setInstagramCardForm({...instagramCardForm, tagsEn: [...instagramCardForm.tagsEn, '']})
  }

  const removeInstagramTagEn = (index: number) => {
    const newTags = instagramCardForm.tagsEn.filter((_, i) => i !== index)
    setInstagramCardForm({...instagramCardForm, tagsEn: newTags})
  }

  const updateInstagramTagEn = (index: number, value: string) => {
    const newTags = [...instagramCardForm.tagsEn]
    newTags[index] = value
    setInstagramCardForm({...instagramCardForm, tagsEn: newTags})
  }


  const addInstagramBenefit = () => {
    setInstagramCardForm({...instagramCardForm, benefits: [...instagramCardForm.benefits, '']})
  }

  const removeInstagramBenefit = (index: number) => {
    const newBenefits = instagramCardForm.benefits.filter((_, i) => i !== index)
    setInstagramCardForm({...instagramCardForm, benefits: newBenefits})
  }


  const addInstagramBenefitEn = () => {
    setInstagramCardForm({...instagramCardForm, benefitsEn: [...instagramCardForm.benefitsEn, '']})
  }

  const removeInstagramBenefitEn = (index: number) => {
    const newBenefits = instagramCardForm.benefitsEn.filter((_, i) => i !== index)
    setInstagramCardForm({...instagramCardForm, benefitsEn: newBenefits})
  }

  const updateInstagramBenefitEn = (index: number, value: string) => {
    const newBenefits = [...instagramCardForm.benefitsEn]
    newBenefits[index] = value
    setInstagramCardForm({...instagramCardForm, benefitsEn: newBenefits})
  }


  const updateInstagramRequirement = (index: number, value: string) => {
    const newRequirements = [...instagramCardForm.requirements]
    newRequirements[index] = value
    setInstagramCardForm({...instagramCardForm, requirements: newRequirements})
  }

  const addInstagramRequirement = () => {
    setInstagramCardForm({...instagramCardForm, requirements: [...instagramCardForm.requirements, '']})
  }

  const removeInstagramRequirement = (index: number) => {
    const newRequirements = instagramCardForm.requirements.filter((_, i) => i !== index)
    setInstagramCardForm({...instagramCardForm, requirements: newRequirements})
  }


  const addInstagramRequirementEn = () => {
    setInstagramCardForm({...instagramCardForm, requirementsEn: [...instagramCardForm.requirementsEn, '']})
  }

  const removeInstagramRequirementEn = (index: number) => {
    const newRequirements = instagramCardForm.requirementsEn.filter((_, i) => i !== index)
    setInstagramCardForm({...instagramCardForm, requirementsEn: newRequirements})
  }

  const updateInstagramRequirementEn = (index: number, value: string) => {
    const newRequirements = [...instagramCardForm.requirementsEn]
    newRequirements[index] = value
    setInstagramCardForm({...instagramCardForm, requirementsEn: newRequirements})
  }


  // 인스타그램 이미지 업로드 관련 함수들
  const handleInstagramMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 기존 미리보기 URL 해제
    instagramCardForm.imagePreviews.forEach(url => URL.revokeObjectURL(url))

    const newImages: File[] = []
    const newPreviews: string[] = []

    files.forEach((file, index) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`파일 ${file.name}이 5MB를 초과합니다.`)
        return
      }

      newImages.push(file)
      const previewUrl = URL.createObjectURL(file)
      newPreviews.push(previewUrl)

      // 첫 번째 이미지는 메인 이미지로 설정
      if (index === 0) {
        setInstagramCardForm(prev => ({
          ...prev,
          image: file,
          imagePreview: previewUrl
        }))
      }
    })

    setInstagramCardForm(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
      imagePreviews: [...prev.imagePreviews, ...newPreviews]
    }))
  }

  const handleInstagramImageRemove = () => {
    if (instagramCardForm.imagePreview) {
      URL.revokeObjectURL(instagramCardForm.imagePreview)
    }
    setInstagramCardForm(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }))
  }

  const handleInstagramImageRemoveAt = (index: number) => {
    const newPreviews = [...instagramCardForm.imagePreviews]
    URL.revokeObjectURL(newPreviews[index])
    newPreviews.splice(index, 1)

    const newImages = [...instagramCardForm.images]
    newImages.splice(index, 1)

    setInstagramCardForm(prev => ({
      ...prev,
      images: newImages,
      imagePreviews: newPreviews
    }))
  }

  const handleInstagramAllImagesRemove = () => {
    instagramCardForm.imagePreviews.forEach(url => URL.revokeObjectURL(url))
    setInstagramCardForm(prev => ({
      ...prev,
      image: null,
      imagePreview: '',
      images: [],
      imagePreviews: []
    }))
  }

  // 인스타그램 카드 제출
  const handleInstagramCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 필수 필드 검증
    if (!instagramCardForm.activityType || !instagramCardForm.title || !instagramCardForm.titleEn ||
        !instagramCardForm.category || !instagramCardForm.description || !instagramCardForm.descriptionEn ||
        !instagramCardForm.maxParticipants || !instagramCardForm.experienceStartDate || !instagramCardForm.experienceEndDate || 
        !instagramCardForm.recruitmentStartDate || !instagramCardForm.recruitmentEndDate ||
        !instagramCardForm.location || !instagramCardForm.locationEn) {
      setInstagramCardMessage('모든 필수 필드를 입력해주세요.')
      return
    }

    if (instagramCardForm.category === 'other' && !instagramCardForm.customCategory) {
      setInstagramCardMessage('기타 카테고리를 입력해주세요.')
      return
    }

    if (instagramCardForm.benefits.some(b => !b.trim()) || instagramCardForm.benefitsEn.some(b => !b.trim()) ||
        instagramCardForm.requirements.some(r => !r.trim()) || instagramCardForm.requirementsEn.some(r => !r.trim())) {
      setInstagramCardMessage('혜택과 조건을 모두 입력해주세요.')
      return
    }

    setInstagramCardSubmitting(true)

    try {
      const { collection, addDoc, updateDoc, doc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      const { uploadImage, uploadImages } = await import('@/lib/imageService')

      let imageUrl = ''
      let imageUrls: string[] = []

      // 이미지 업로드
      if (instagramCardForm.image) {
        const imageResult = await uploadImage(instagramCardForm.image, 'instagram_experiences')
        if (imageResult.success && imageResult.url) {
          imageUrl = imageResult.url
        } else {
          throw new Error(`이미지 업로드 실패: ${imageResult.error}`)
        }
      }

      if (instagramCardForm.images.length > 0) {
        imageUrls = await uploadImages(instagramCardForm.images, 'instagram_experiences')
      }

      // 체험단 데이터 생성
      const experienceData = {
        activityType: instagramCardForm.activityType,
        title: instagramCardForm.title,
        titleEn: instagramCardForm.titleEn,
        category: instagramCardForm.category === 'other' ? instagramCardForm.customCategory : instagramCardForm.category,
        description: instagramCardForm.description,
        descriptionEn: instagramCardForm.descriptionEn,
        maxParticipants: parseInt(instagramCardForm.maxParticipants),
        startDate: instagramCardForm.experienceStartDate,
        endDate: instagramCardForm.experienceEndDate,
        recruitmentStartDate: instagramCardForm.recruitmentStartDate,
        recruitmentEndDate: instagramCardForm.recruitmentEndDate,
        location: instagramCardForm.location,
        locationEn: instagramCardForm.locationEn,
        tags: instagramCardForm.tags.filter(t => t.trim()),
        tagsEn: instagramCardForm.tagsEn.filter(t => t.trim()),
        benefits: instagramCardForm.benefits.filter(b => b.trim()),
        benefitsEn: instagramCardForm.benefitsEn.filter(b => b.trim()),
        requirements: instagramCardForm.requirements.filter(r => r.trim()),
        requirementsEn: instagramCardForm.requirementsEn.filter(r => r.trim()),
        image: imageUrl,
        images: imageUrls,
        status: 'recruiting',
        applications: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (instagramEditingCardId) {
        // 수정 모드
        const experienceRef = doc(db, 'instagram_experiences', instagramEditingCardId)
        await updateDoc(experienceRef, {
          ...experienceData,
          updatedAt: new Date()
        })
        setInstagramCardMessage('인스타그램 체험단이 성공적으로 수정되었습니다.')
      } else {
        // 생성 모드
        await addDoc(collection(db, 'instagram_experiences'), experienceData)
        setInstagramCardMessage('인스타그램 체험단이 성공적으로 생성되었습니다.')
      }

      // 폼 초기화
      setInstagramCardForm({
        activityType: '',
        title: '',
        titleEn: '',
        titleZh: '',
        category: '',
        customCategory: '',
        description: '',
        descriptionEn: '',
        descriptionZh: '',
        maxParticipants: '',
        experienceStartDate: '',
        experienceEndDate: '',
        recruitmentStartDate: '',
        recruitmentEndDate: '',
        location: '',
        locationEn: '',
        locationZh: '',
        tags: [''],
        tagsEn: [''],
        benefits: [''],
        benefitsEn: [''],
        benefitsZh: [''],
        requirements: [''],
        requirementsEn: [''],
        requirementsZh: [''],
        image: null,
        imagePreview: '',
        images: [],
        imagePreviews: []
      })
      setInstagramShowCustomCategory(false)
      setInstagramEditingCardId(null)

      // 데이터 새로고침
      loadInstagramAllExperiences()
      loadInstagramData()

    } catch (error) {
      console.error('인스타그램 체험단 생성/수정 오류:', error)
      setInstagramCardMessage('체험단 생성/수정에 실패했습니다.')
    } finally {
      setInstagramCardSubmitting(false)
      setTimeout(() => setInstagramCardMessage(''), 3000)
    }
  }

  // 인스타그램 카드 수정
  const handleInstagramEditCard = (experience: Experience) => {
    setInstagramEditingCardId(experience.id)
    setInstagramCardForm({
      activityType: experience.activityType || '',
      title: experience.title || '',
      titleEn: experience.titleEn || '',
      titleZh: experience.titleZh || '',
      category: experience.category || '',
      customCategory: '',
      description: experience.description || '',
      descriptionEn: experience.descriptionEn || '',
      descriptionZh: experience.descriptionZh || '',
      maxParticipants: experience.maxParticipants?.toString() || '',
      experienceStartDate: experience.startDate ? (experience.startDate instanceof Date ? experience.startDate.toISOString().split('T')[0] : experience.startDate) : '',
      experienceEndDate: experience.endDate ? (experience.endDate instanceof Date ? experience.endDate.toISOString().split('T')[0] : experience.endDate) : '',
      recruitmentStartDate: experience.recruitmentStartDate || '',
      recruitmentEndDate: experience.recruitmentEndDate || '',
      location: experience.location || '',
      locationEn: experience.locationEn || '',
      locationZh: experience.locationZh || '',
      tags: Array.isArray(experience.tags) && experience.tags.length > 0 ? experience.tags : [''],
      tagsEn: Array.isArray(experience.tagsEn) && experience.tagsEn.length > 0 ? experience.tagsEn : [''],
      benefits: Array.isArray(experience.benefits) && experience.benefits.length > 0 ? experience.benefits : [''],
      benefitsEn: Array.isArray(experience.benefitsEn) && experience.benefitsEn.length > 0 ? experience.benefitsEn : [''],
      benefitsZh: Array.isArray(experience.benefitsZh) && experience.benefitsZh.length > 0 ? experience.benefitsZh : [''],
      requirements: Array.isArray(experience.requirements) && experience.requirements.length > 0 ? experience.requirements : [''],
      requirementsEn: Array.isArray(experience.requirementsEn) && experience.requirementsEn.length > 0 ? experience.requirementsEn : [''],
      requirementsZh: Array.isArray(experience.requirementsZh) && experience.requirementsZh.length > 0 ? experience.requirementsZh : [''],
      image: null,
      imagePreview: experience.image || '',
      images: [],
      imagePreviews: Array.isArray(experience.images) ? experience.images : []
    })
    
    if (experience.category && !['beauty', 'restaurant', 'dessert', 'plastic-surgery', 'dermatology', 'accommodation'].includes(experience.category)) {
      setInstagramShowCustomCategory(true)
      setInstagramCardForm(prev => ({ ...prev, customCategory: experience.category || '' }))
    }
    
    setActiveTab('instagram-create-card')
  }

  // 인스타그램 카드 삭제
  const handleInstagramDeleteCard = async (experienceId: string) => {
    if (!confirm('이 체험단을 삭제하시겠습니까?')) {
      return
    }
    
    try {
      const { doc, deleteDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const experienceRef = doc(db, 'instagram_experiences', experienceId)
      await deleteDoc(experienceRef)
      
      // 데이터 새로고침
      loadInstagramAllExperiences()
      loadInstagramData()
      
    } catch (error) {
      console.error('인스타그램 체험단 삭제 오류:', error)
    }
  }

  // 인스타그램 엑셀 데이터 로딩
  const loadInstagramExcelData = async () => {
    setInstagramExcelLoading(true)
    setInstagramExcelMessage('')
    
    try {
      console.log('=== 인스타그램 엑셀 데이터 로딩 시작 ===')
      
      // 인스타그램 체험단 ID 목록
      const instagramExperienceIds = instagramAllExperiences.map(exp => exp.id)
      
      if (instagramExperienceIds.length === 0) {
        setInstagramExcelData([])
        setInstagramExcelMessage('인스타그램 체험단이 없습니다.')
        return
      }
      
      const result = await getAllApplications()
      if (result.success) {
        // 인스타그램 체험단 신청만 필터링
        const instagramApps = result.applications?.filter(app => 
          app.experienceId && instagramExperienceIds.includes(app.experienceId)
        ) || []
        
        console.log('인스타그램 신청 데이터:', instagramApps.length)
        
        // 엑셀 데이터 형식으로 변환
        const excelData = instagramApps.map(app => {
          const experience = instagramAllExperiences.find(exp => exp.id === app.experienceId)
          return {
            '신청자 이름': app.name || '이름 없음',
            '체험단 제목': experience?.title || '체험단 없음',
            '체험단 카테고리': experience?.category || '카테고리 없음',
            '신청 상태': app.status === 'approved' ? '승인' : 
                        app.status === 'rejected' ? '거절' : '대기중',
            '신청 일시': app.createdAt ? new Date(app.createdAt).toLocaleString('ko-KR') : '날짜 없음',
            '방문 예정일': app.visitDate || '날짜 없음',
            '방문 시간': `${app.visitTimePeriod} ${app.visitTimeHour}:${app.visitTimeMinute}` || '시간 없음',
            '방문 인원': `${app.visitCount}명` || '인원 없음',
            '팔로워 수': `${app.followerCount?.toLocaleString()}명` || '0명',
            '위쳇 ID': app.wechatId || 'ID 없음',
            '인스타그램 ID': app.xiaohongshuId || 'ID 없음'
          }
        })
        
        setInstagramExcelData(excelData)
        setInstagramExcelMessage(`인스타그램 신청 데이터 ${excelData.length}개를 성공적으로 로드했습니다.`)
        console.log('인스타그램 엑셀 데이터 변환 완료:', excelData.length)
      }
    } catch (error) {
      console.error('인스타그램 엑셀 데이터 로딩 오류:', error)
      setInstagramExcelMessage('데이터 로딩에 실패했습니다.')
    } finally {
      setInstagramExcelLoading(false)
      setTimeout(() => setInstagramExcelMessage(''), 3000)
    }
  }

  // 인스타그램 엑셀 다운로드
  const handleInstagramExcelDownload = async () => {
    if (instagramExcelData.length === 0) {
      setInstagramExcelMessage('다운로드할 데이터가 없습니다.')
      return
    }
    
    try {
      const XLSX = await import('xlsx')
      
      // 워크시트 생성
      const ws = XLSX.utils.json_to_sheet(instagramExcelData)
      
      // 컬럼 너비 설정
      const colWidths = [
        { wch: 15 }, // 신청자 이름
        { wch: 25 }, // 신청자 이메일
        { wch: 15 }, // 신청자 전화번호
        { wch: 30 }, // 체험단 제목
        { wch: 15 }, // 체험단 카테고리
        { wch: 10 }, // 신청 상태
        { wch: 20 }, // 신청 일시
        { wch: 15 }, // 방문 예정일
        { wch: 15 }, // 방문 시간
        { wch: 10 }, // 방문 인원
        { wch: 15 }, // 팔로워 수
        { wch: 20 }, // 위쳇 ID
        { wch: 20 }, // 인스타그램 ID
        { wch: 30 }  // 특이사항
      ]
      ws['!cols'] = colWidths
      
      // 워크북 생성
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, '인스타그램 신청리스트')
      
      // 파일명 생성 (현재 날짜 포함)
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0]
      const fileName = `인스타그램_체험단_신청리스트_${dateStr}.xlsx`
      
      // 파일 다운로드
      XLSX.writeFile(wb, fileName)
      
      setInstagramExcelMessage('엑셀 파일이 성공적으로 다운로드되었습니다.')
      console.log('인스타그램 엑셀 다운로드 완료:', fileName)
      
    } catch (error) {
      console.error('인스타그램 엑셀 다운로드 오류:', error)
      setInstagramExcelMessage('엑셀 다운로드에 실패했습니다.')
    }
  }

  // 사용자 데이터 로딩
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadUsers()
      loadUserStats()
      loadExperienceData()
      loadInstagramData()
      loadInstagramUserStats()
      loadInstagramAllExperiences()
      loadApplications()
      loadApplicationStats()
      loadAllExperiences()
    }
  }, [isAuthenticated, isAdmin])

  // 체험단 데이터가 로드되면 신청인원도 로드
  useEffect(() => {
    if (allExperiences.length > 0) {
      loadExperienceApplicationCounts()
    }
  }, [allExperiences])

  // 인스타그램 체험단 데이터가 로드되면 신청인원도 로드
  useEffect(() => {
    if (instagramRecentExperiences.length > 0) {
      loadInstagramExperienceApplicationCounts()
    }
  }, [instagramRecentExperiences])

  // 인스타그램 모든 체험단 데이터가 로드되면 신청 데이터도 로드
  useEffect(() => {
    if (instagramAllExperiences.length > 0) {
      loadInstagramApplications()
    }
  }, [instagramAllExperiences, loadInstagramApplications])

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-600">권한 확인 중...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">접근 권한 없음</h1>
          <p className="text-gray-600 mb-4">관리자 권한이 필요한 페이지입니다.</p>
          <p className="text-sm text-gray-500">현재 역할: {userRole === 'advertiser' ? '광고주' : '일반회원'}</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    // 사용자 관리 (독립)
    { id: 'users', label: '사용자 관리', icon: Users, isHeader: true },
    
    // 구분선
    { id: 'divider1', label: '', icon: null, isDivider: true },
    
    // 샤오홍슈 섹션
    { id: 'xiaohongshu', label: '샤오홍슈', icon: BarChart3, isHeader: true },
    { id: 'dashboard', label: '대시보드', icon: BarChart3, section: 'xiaohongshu' },
    { id: 'experiences', label: '체험단 관리', icon: Activity, section: 'xiaohongshu' },
    { id: 'applications', label: '신청 관리', icon: FileText, section: 'xiaohongshu' },
    { id: 'create-card', label: '신청 카드 만들기', icon: Plus, section: 'xiaohongshu' },
    { id: 'edit-cards', label: '신청 카드 수정', icon: FileText, section: 'xiaohongshu' },
    { id: 'excel-export', label: '업체별 체험단 신청리스트', icon: Download, section: 'xiaohongshu' },
    
    // 구분선
    { id: 'divider2', label: '', icon: null, isDivider: true },
    
    // 인스타그램 섹션
    { id: 'instagram', label: '인스타체험단', icon: BarChart3, isHeader: true },
    { id: 'instagram-dashboard', label: '대시보드', icon: BarChart3, section: 'instagram' },
    { id: 'instagram-experiences', label: '체험단 관리', icon: Activity, section: 'instagram' },
    { id: 'instagram-applications', label: '신청 관리', icon: FileText, section: 'instagram' },
    { id: 'instagram-create-card', label: '신청 카드 만들기', icon: Plus, section: 'instagram' },
    { id: 'instagram-edit-cards', label: '신청 카드 수정', icon: FileText, section: 'instagram' },
    { id: 'instagram-excel-export', label: '업체별 체험단 신청리스트', icon: Download, section: 'instagram' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">대시보드</h2>
                <p className="text-gray-600">시스템 현황을 한눈에 확인하세요</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    console.log('=== 데이터 확인 시작 ===')
                    try {
                      // Firestore 직접 조회
                      const { collection, getDocs } = await import('firebase/firestore')
                      const { db } = await import('@/lib/firebase')
                      
                      // experiences 컬렉션 확인
                      const experiencesRef = collection(db, 'experiences')
                      const experiencesSnapshot = await getDocs(experiencesRef)
                      console.log('experiences 컬렉션 문서 수:', experiencesSnapshot.docs.length)
                      experiencesSnapshot.docs.forEach((doc, index) => {
                        const data = doc.data()
                        console.log(`체험단 ${index + 1}:`, { 
                          id: doc.id, 
                          title: data.title, 
                          applicationsCount: data.applications?.length || 0,
                          applications: data.applications
                        })
                      })
                    } catch (error) {
                      console.error('데이터 확인 오류:', error)
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  🔍 데이터 확인
                </button>
                <button
                  onClick={() => {
                    loadApplications()
                    loadApplicationStats()
                    loadUsers()
                    loadUserStats()
                  }}
                  disabled={applicationsLoading}
                  className="bg-blue-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
                >
                  <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
                  {applicationsLoading ? '로딩 중...' : '전체 새로고침'}
                </button>
              </div>
            </div>
            
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 sm:p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">총 사용자</p>
                    <p className="text-3xl font-bold">{userStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">오늘 가입</p>
                    <p className="text-3xl font-bold">{userStats.todayUsers}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">이번 주 가입</p>
                    <p className="text-3xl font-bold">{userStats.thisWeekUsers}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">총 신청</p>
                    <p className="text-3xl font-bold">{applicationStats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* 신청 상태별 통계 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">대기중</p>
                    <p className="text-2xl font-bold text-gray-900">{applicationStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">승인</p>
                    <p className="text-2xl font-bold text-gray-900">{applicationStats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">거절</p>
                    <p className="text-2xl font-bold text-gray-900">{applicationStats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 체험단 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* 최근 체험단 목록 */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">최근 체험단</h3>
                  <span className="text-sm text-gray-500">{recentExperiences.length}개</span>
                </div>
                <div className="space-y-3">
                  {recentExperiences.length === 0 ? (
                    <div className="text-center py-4">
                      <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">체험단이 없습니다</p>
                    </div>
                  ) : (
                    recentExperiences.map((experience) => (
                      <div key={experience.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${
                          getStatusByDate(experience) === 'recruiting' ? 'bg-green-500' :
                          getStatusByDate(experience) === 'ongoing' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{experience.title}</p>
                          <p className="text-xs text-gray-500">
                            {experienceApplicationCounts[experience.id] !== undefined 
                              ? `${experienceApplicationCounts[experience.id]}/${experience.maxParticipants}명 참여`
                              : '신청인원 로딩중...'
                            }
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          getStatusByDate(experience) === 'recruiting' ? 'bg-green-100 text-green-800' :
                          getStatusByDate(experience) === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusByDate(experience) === 'recruiting' ? '모집중' :
                           getStatusByDate(experience) === 'ongoing' ? '진행중' : '완료'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 오늘 방문하는 체험단 */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">오늘 방문</h3>
                  <span className="text-sm text-gray-500">{todayExperiences.length}개</span>
                </div>
                <div className="space-y-3">
                  {todayExperiences.length === 0 ? (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">오늘 방문할 체험단이 없습니다</p>
                    </div>
                  ) : (
                    todayExperiences.map((experience) => (
                      <div key={experience.id} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{experience.title}</p>
                          <p className="text-xs text-gray-500">
                            {experienceApplicationCounts[experience.id] !== undefined 
                              ? `${experienceApplicationCounts[experience.id]}/${experience.maxParticipants}명 참여`
                              : '신청인원 로딩중...'
                            }
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                          긴급
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">사용자 관리</h2>
                <p className="text-gray-600">등록된 사용자들을 관리하세요</p>
              </div>
              <button 
                onClick={loadUsers}
                disabled={usersLoading}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${usersLoading ? 'animate-spin' : ''}`} />
                <span>{usersLoading ? '로딩 중...' : '새로고침'}</span>
              </button>
            </div>

            {/* 관리자 정보 */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">관리자</h3>
                  <p className="text-red-100">{user?.email}</p>
                  <p className="text-sm text-red-200">시스템 관리자 권한</p>
                </div>
              </div>
            </div>

            {/* 메시지 표시 */}
            {userMessage && (
              <div className={`p-4 rounded-lg ${
                userMessage.includes('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {userMessage}
              </div>
            )}

            {usersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  <span className="text-gray-600">사용자 목록을 불러오는 중...</span>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">등록된 사용자가 없습니다</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">사용자 목록 ({users.length}명)</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <div key={user.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                      {/* 모바일: 카드 형태, PC: 기존 형태 */}
                      <div className="block sm:hidden">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.displayName || '이름 없음'}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {user.createdAt ? 
                                (user.createdAt instanceof Date ? 
                                  user.createdAt.toLocaleDateString('ko-KR') : 
                                  new Date(user.createdAt).toLocaleDateString('ko-KR')) : 
                                '날짜 없음'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'advertiser' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role === 'admin' ? '관리자' :
                               user.role === 'advertiser' ? '광고주' : '일반회원'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* 역할 수정 */}
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => handleRoleUpdate(user.id, e.target.value as UserRole)}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <option value="user">일반회원</option>
                              <option value="advertiser">광고주</option>
                              <option value="admin">관리자</option>
                            </select>
                            
                            {/* 삭제 버튼 */}
                            <button
                              onClick={() => handleUserDelete(user.id, user.displayName || '사용자')}
                              className="text-red-600 hover:text-red-800 p-1 transition-colors"
                              title="사용자 삭제"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* PC: 기존 형태 */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.displayName?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.displayName || '이름 없음'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {user.createdAt ? 
                                (user.createdAt instanceof Date ? 
                                  user.createdAt.toLocaleDateString('ko-KR') : 
                                  new Date(user.createdAt).toLocaleDateString('ko-KR')) : 
                                '날짜 없음'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'advertiser' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role === 'admin' ? '관리자' :
                                 user.role === 'advertiser' ? '광고주' : '일반회원'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* 역할 수정 */}
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => handleRoleUpdate(user.id, e.target.value as UserRole)}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              <option value="user">일반회원</option>
                              <option value="advertiser">광고주</option>
                              <option value="admin">관리자</option>
                            </select>
                            
                            {/* 삭제 버튼 */}
                            <button
                              onClick={() => handleUserDelete(user.id, user.displayName || '사용자')}
                              className="text-red-600 hover:text-red-800 p-1 transition-colors"
                              title="사용자 삭제"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'experiences':

        const recruitingExperiences = allExperiences.filter(exp => getStatusByDate(exp) === 'recruiting')
        const ongoingExperiences = allExperiences.filter(exp => getStatusByDate(exp) === 'ongoing')
        const completedExperiences = allExperiences.filter(exp => getStatusByDate(exp) === 'completed')

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">체험단 관리</h2>
              <p className="text-gray-600">체험단 활동을 관리하세요</p>
              {experienceMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  experienceMessage.includes('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {experienceMessage}
                </div>
              )}
            </div>
            
            {/* 체험단 현황 통계 */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">체험단 현황</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">모집중</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-2">{experienceStats.recruiting}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">진행중</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{experienceStats.ongoing}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">완료</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600 mt-2">{experienceStats.completed}</p>
                </div>
              </div>
            </div>

            {/* 모집중인 체험단 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">모집중인 체험단</h3>
                  <span className="text-sm text-gray-500">{recruitingExperiences.length}개</span>
                </div>
              </div>
              <div className="p-6">
                {experiencesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">체험단을 불러오는 중...</span>
                  </div>
                ) : recruitingExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">모집중인 체험단이 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recruitingExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{experience.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            getStatusByDate(experience) === 'recruiting' 
                              ? 'bg-green-100 text-green-800'
                              : getStatusByDate(experience) === 'ongoing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusByDate(experience) === 'recruiting' 
                              ? '모집중'
                              : getStatusByDate(experience) === 'ongoing'
                              ? '진행중'
                              : '완료'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="font-medium text-red-600">
                            {experienceApplicationCounts[experience.id] !== undefined 
                              ? `${experienceApplicationCounts[experience.id]} / ${experience.maxParticipants}명 모집`
                              : '신청인원 로딩중...'
                            }
                          </span>
                          <span>{experience.daysLeft}일 남음</span>
                        </div>
                        
                        {/* 상태 수정 및 삭제 버튼 */}
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => handleExperienceStatusUpdate(experience.id, e.target.value as 'recruiting' | 'ongoing' | 'completed')}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            defaultValue={getStatusByDate(experience)}
                          >
                            <option value="recruiting">모집중</option>
                            <option value="ongoing">진행중</option>
                            <option value="completed">완료</option>
                          </select>
                          <button
                            onClick={() => handleExperienceDelete(experience.id, experience.title)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 진행중인 체험단 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">진행중인 체험단</h3>
                  <span className="text-sm text-gray-500">{ongoingExperiences.length}개</span>
                </div>
              </div>
              <div className="p-6">
                {ongoingExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">진행중인 체험단이 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ongoingExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{experience.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            getStatusByDate(experience) === 'recruiting' 
                              ? 'bg-green-100 text-green-800'
                              : getStatusByDate(experience) === 'ongoing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusByDate(experience) === 'recruiting' 
                              ? '모집중'
                              : getStatusByDate(experience) === 'ongoing'
                              ? '진행중'
                              : '완료'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="font-medium text-red-600">
                            {experienceApplicationCounts[experience.id] !== undefined 
                              ? `${experienceApplicationCounts[experience.id]} / ${experience.maxParticipants}명 모집`
                              : '신청인원 로딩중...'
                            }
                          </span>
                          <span>{experience.daysLeft}일 남음</span>
                        </div>
                        
                        {/* 상태 수정 및 삭제 버튼 */}
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => handleExperienceStatusUpdate(experience.id, e.target.value as 'recruiting' | 'ongoing' | 'completed')}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            defaultValue={getStatusByDate(experience)}
                          >
                            <option value="recruiting">모집중</option>
                            <option value="ongoing">진행중</option>
                            <option value="completed">완료</option>
                          </select>
                          <button
                            onClick={() => handleExperienceDelete(experience.id, experience.title)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 완료된 체험단 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">완료된 체험단</h3>
                  <span className="text-sm text-gray-500">{completedExperiences.length}개</span>
                </div>
              </div>
              <div className="p-6">
                {completedExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">완료된 체험단이 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{experience.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            getStatusByDate(experience) === 'recruiting' 
                              ? 'bg-green-100 text-green-800'
                              : getStatusByDate(experience) === 'ongoing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusByDate(experience) === 'recruiting' 
                              ? '모집중'
                              : getStatusByDate(experience) === 'ongoing'
                              ? '진행중'
                              : '완료'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="font-medium text-red-600">
                            {experienceApplicationCounts[experience.id] !== undefined 
                              ? `${experienceApplicationCounts[experience.id]} / ${experience.maxParticipants}명 모집`
                              : '신청인원 로딩중...'
                            }
                          </span>
                          <span>완료됨</span>
                        </div>
                        
                        {/* 상태 수정 및 삭제 버튼 */}
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => handleExperienceStatusUpdate(experience.id, e.target.value as 'recruiting' | 'ongoing' | 'completed')}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            defaultValue={getStatusByDate(experience)}
                          >
                            <option value="recruiting">모집중</option>
                            <option value="ongoing">진행중</option>
                            <option value="completed">완료</option>
                          </select>
                          <button
                            onClick={() => handleExperienceDelete(experience.id, experience.title)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'applications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">신청 관리</h2>
                <p className="text-gray-600">체험단 신청 현황을 관리하세요</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    console.log('=== 신청 관리 데이터 확인 시작 ===')
                    try {
                      // Firestore 직접 조회
                      const { collection, getDocs } = await import('firebase/firestore')
                      const { db } = await import('@/lib/firebase')
                      
                      // experiences 컬렉션의 applications 배열 확인
                      const experiencesRef = collection(db, 'experiences')
                      const experiencesSnapshot = await getDocs(experiencesRef)
                      experiencesSnapshot.docs.forEach((doc, index) => {
                        const data = doc.data()
                        console.log(`체험단 ${index + 1}:`, { 
                          id: doc.id, 
                          title: data.title, 
                          applicationsCount: data.applications?.length || 0
                        })
                        if (data.applications && data.applications.length > 0) {
                          console.log(`  신청서들:`, data.applications)
                        }
                      })
                    } catch (error) {
                      console.error('신청 관리 데이터 확인 오류:', error)
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  🔍 신청 데이터 확인
                </button>
                <button
                  onClick={() => {
                    loadApplications()
                    loadApplicationStats()
                  }}
                  disabled={applicationsLoading}
                  className="bg-blue-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
                >
                  <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
                  {applicationsLoading ? '로딩 중...' : '데이터 새로고침'}
                </button>
              </div>
            </div>
            

            {/* 신청 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <button 
                onClick={() => setApplicationFilter('all')}
                className={`bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  applicationFilter === 'all' ? 'ring-4 ring-blue-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">총 신청</p>
                    <p className="text-3xl font-bold">{applicationStats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-200" />
                </div>
              </button>
              
              <button 
                onClick={() => setApplicationFilter('pending')}
                className={`bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  applicationFilter === 'pending' ? 'ring-4 ring-yellow-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">대기중</p>
                    <p className="text-3xl font-bold">{applicationStats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </button>
              
              <button 
                onClick={() => setApplicationFilter('approved')}
                className={`bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  applicationFilter === 'approved' ? 'ring-4 ring-green-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">승인됨</p>
                    <p className="text-3xl font-bold">{applicationStats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </button>
              
              <button 
                onClick={() => setApplicationFilter('rejected')}
                className={`bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  applicationFilter === 'rejected' ? 'ring-4 ring-red-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">거부됨</p>
                    <p className="text-3xl font-bold">{applicationStats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-200" />
                </div>
              </button>
            </div>

            {/* 신청서 목록 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      신청서 목록
                      {applicationFilter !== 'all' && (
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          ({applicationFilter === 'pending' ? '대기중' : 
                            applicationFilter === 'approved' ? '승인됨' : '거부됨'} 필터 적용)
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const filteredApplications = applicationFilter === 'all' 
                          ? applications 
                          : applications.filter(app => app.status === applicationFilter)
                        return `총 ${filteredApplications.length}개의 신청서`
                      })()}
                      {applications.filter(app => !app.name || !app.experienceTitle || !app.visitDate).length > 0 && (
                        <span className="ml-2 text-red-600 font-medium">
                          (이슈 {applications.filter(app => !app.name || !app.experienceTitle || !app.visitDate).length}개)
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={loadApplications}
                    disabled={applicationsLoading}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                </div>
              </div>

              {applicationMessage && (
                <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
                  applicationMessage.includes('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {applicationMessage}
                </div>
              )}

              <div className="p-6">
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">신청서를 불러오는 중...</span>
                  </div>
                ) : (() => {
                  const filteredApplications = applicationFilter === 'all' 
                    ? applications 
                    : applications.filter(app => app.status === applicationFilter)
                  
                  return filteredApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {applicationFilter === 'all' ? '신청서가 없습니다' : 
                         `${applicationFilter === 'pending' ? '대기중' : 
                           applicationFilter === 'approved' ? '승인됨' : '거부됨'} 신청서가 없습니다`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredApplications.map((application) => {
                      // 오류가 있는 신청서 식별
                      const hasError = !application.name || !application.experienceTitle || !application.visitDate
                      return (
                      <div key={application.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                        hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}>
                        <div className="space-y-4">
                          {/* 상단: 이름, 상태, 오류 표시 */}
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900 truncate">{application.name || '이름 없음'}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {application.status === 'pending' ? '대기중' :
                               application.status === 'approved' ? '승인됨' : '거부됨'}
                            </span>
                            {hasError && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 whitespace-nowrap">
                                오류
                              </span>
                            )}
                          </div>
                          
                          {/* 체험단 제목 */}
                          <p className="text-sm text-gray-600 truncate">{application.experienceTitle}</p>
                          
                          {/* 주요 정보 그리드 */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">방문일</div>
                              <div className="font-medium">{application.visitDate || '미입력'}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">방문시간</div>
                              <div className="font-medium">{application.visitTimePeriod} {application.visitTimeHour}:{application.visitTimeMinute}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">인원</div>
                              <div className="font-medium">{application.visitCount}명</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">팔로워</div>
                              <div className="font-medium">{application.followerCount.toLocaleString()}명</div>
                            </div>
                          </div>
                          
                          {/* 연락처 정보 */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">위쳇:</span>
                              <span className="font-medium text-gray-900">{application.wechatId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">샤오홍슈:</span>
                              <span className="font-medium text-gray-900">{application.xiaohongshuId}</span>
                            </div>
                          </div>
                          
                          {/* 액션 버튼들 - 가운데 정렬 */}
                          <div className="flex items-center justify-center space-x-2 pt-2 border-t border-gray-200">
                            {application.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApplicationStatusUpdate(application.id!, 'approved')}
                                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleApplicationStatusUpdate(application.id!, 'rejected')}
                                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap"
                                >
                                  거부
                                </button>
                              </>
                            )}
                            {application.status === 'approved' && (
                              <button
                                onClick={() => handleCancelApproval(application.id!)}
                                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium whitespace-nowrap"
                              >
                                승인 취소
                              </button>
                            )}
                            {application.status === 'rejected' && (
                              <button
                                onClick={() => handleCancelRejection(application.id!)}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                              >
                                거부 취소
                              </button>
                            )}
                            <button
                              onClick={() => handleApplicationDelete(application.id!, application.name)}
                              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium whitespace-nowrap"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )
              })()}
              </div>
            </div>
          </div>
        )

      case 'create-card':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">신청 카드 만들기</h2>
              <p className="text-gray-600">새로운 체험단 신청 카드를 생성하세요</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">카드 정보 입력</h3>
              <form onSubmit={handleCardSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">활동 유형 *</label>
                    <select 
                      value={cardForm.activityType}
                      onChange={(e) => setCardForm({...cardForm, activityType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">활동 유형 선택</option>
                      <option value="experience">체험단</option>
                      <option value="reporter">기자단</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목 (한국어) *</label>
                    <input
                      type="text"
                      value={cardForm.title}
                      onChange={(e) => setCardForm({...cardForm, title: e.target.value})}
                      placeholder="예: 하리 원장님 헤어 체험"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목 (중국어) *</label>
                    <input
                      type="text"
                      value={cardForm.titleZh}
                      onChange={(e) => setCardForm({...cardForm, titleZh: e.target.value})}
                      placeholder="예: 河利院长头发体验"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                    <select 
                      value={cardForm.category}
                      onChange={(e) => {
                        setCardForm({...cardForm, category: e.target.value})
                        if (e.target.value === 'other') {
                          setShowCustomCategory(true)
                        } else {
                          setShowCustomCategory(false)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">카테고리 선택</option>
                      <option value="beauty">뷰티</option>
                      <option value="restaurant">맛집</option>
                      <option value="dessert">디저트</option>
                      <option value="plastic-surgery">성형외과</option>
                      <option value="dermatology">피부과</option>
                      <option value="accommodation">숙박</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                </div>
                
                {/* 기타 카테고리 입력 필드 */}
                {showCustomCategory && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">기타 카테고리 입력</label>
                    <input
                      type="text"
                      value={cardForm.customCategory}
                      onChange={(e) => setCardForm({...cardForm, customCategory: e.target.value})}
                      placeholder="카테고리를 직접 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* 태그 입력 필드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">태그 (한국어)</label>
                    <div className="space-y-2">
                      {cardForm.tags && Array.isArray(cardForm.tags) ? cardForm.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateTag(index, e.target.value)}
                            placeholder="태그를 입력하세요"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      )) : null}
                      <button
                        type="button"
                        onClick={addTag}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        + 태그 추가
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">태그 (중국어)</label>
                    <div className="space-y-2">
                      {cardForm.tagsZh && Array.isArray(cardForm.tagsZh) ? cardForm.tagsZh.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateTagZh(index, e.target.value)}
                            placeholder="请输入标签"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeTagZh(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      )) : null}
                      <button
                        type="button"
                        onClick={addTagZh}
                        className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        + 添加标签
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 설명 (한국어) *</label>
                  <textarea
                    rows={4}
                    value={cardForm.description}
                    onChange={(e) => setCardForm({...cardForm, description: e.target.value})}
                    placeholder="체험단에 대한 자세한 설명을 입력하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 설명 (중국어) *</label>
                  <textarea
                    rows={4}
                    value={cardForm.descriptionZh}
                    onChange={(e) => setCardForm({...cardForm, descriptionZh: e.target.value})}
                    placeholder="请输入体验团的详细说明..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">최대 참여자 수 *</label>
                    <input
                      type="number"
                      min="1"
                      value={cardForm.maxParticipants}
                      onChange={(e) => setCardForm({...cardForm, maxParticipants: e.target.value})}
                      placeholder="예: 10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">체험 기간 *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">시작일</label>
                        <input
                          type="date"
                          value={cardForm.experienceStartDate}
                          onChange={(e) => setCardForm({...cardForm, experienceStartDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">종료일</label>
                        <input
                          type="date"
                          value={cardForm.experienceEndDate}
                          onChange={(e) => setCardForm({...cardForm, experienceEndDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">모집 시작일 *</label>
                    <input
                      type="date"
                      value={cardForm.recruitmentStartDate}
                      onChange={(e) => setCardForm({...cardForm, recruitmentStartDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">모집 마감일 *</label>
                    <input
                      type="date"
                      value={cardForm.recruitmentEndDate}
                      onChange={(e) => setCardForm({...cardForm, recruitmentEndDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험 장소 (한국어) *</label>
                  <input
                    type="text"
                    value={cardForm.location}
                    onChange={(e) => setCardForm({...cardForm, location: e.target.value})}
                    placeholder="예: 서울 강남구 청담동 123-45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험 장소 (중국어) *</label>
                  <input
                    type="text"
                    value={cardForm.locationZh}
                    onChange={(e) => setCardForm({...cardForm, locationZh: e.target.value})}
                    placeholder="예: 首尔江南区清潭洞123-45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 이미지 (여러 장 선택 가능)</label>
                  <div className="space-y-4">
                    {/* 메인 이미지 미리보기 */}
                    {cardForm.imagePreview && (
                      <div className="relative">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
                          <span className="text-sm font-medium text-blue-700">메인 이미지 (카드에 표시)</span>
                        </div>
                        <img
                          src={cardForm.imagePreview}
                          alt="메인 이미지 미리보기"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    {/* 모든 이미지 미리보기 */}
                    {cardForm.imagePreviews.length > 0 && (
                      <div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                          <span className="text-sm font-medium text-green-700">상세 페이지 이미지들 ({cardForm.imagePreviews.length}장)</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {cardForm.imagePreviews && Array.isArray(cardForm.imagePreviews) ? cardForm.imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`이미지 ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleImageRemoveAt(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          )) : null}
                        </div>
                        <button
                          type="button"
                          onClick={handleAllImagesRemove}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                          모든 이미지 제거
                        </button>
                      </div>
                    )}
                    
                    {/* 파일 업로드 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImageUpload}
                        className="hidden"
                        id="multiple-image-upload"
                      />
                      <label
                        htmlFor="multiple-image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">클릭하여 여러 이미지 업로드</span>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (최대 5MB, 여러 장 선택 가능)</p>
                          <p className="text-xs text-gray-500">첫 번째 이미지는 카드에, 모든 이미지는 상세 페이지에 표시됩니다</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 혜택 (한국어) *</label>
                  <div className="space-y-2">
                    {cardForm.benefits && Array.isArray(cardForm.benefits) ? cardForm.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateBenefit(index, e.target.value)}
                          placeholder={`혜택 ${index + 1} (예: 무료 체험 제공)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {cardForm.benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + 혜택 추가
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 혜택 (중국어) *</label>
                  <div className="space-y-2">
                    {cardForm.benefitsZh && Array.isArray(cardForm.benefitsZh) ? cardForm.benefitsZh.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateBenefitZh(index, e.target.value)}
                          placeholder={`福利 ${index + 1} (例如: 免费体验)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {cardForm.benefitsZh.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBenefitZh(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addBenefitZh}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + 添加福利
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">참여 조건 (한국어) *</label>
                  <div className="space-y-2">
                    {cardForm.requirements && Array.isArray(cardForm.requirements) ? cardForm.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          placeholder={`조건 ${index + 1} (예: 만 18세 이상)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {cardForm.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + 조건 추가
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">참여 조건 (중국어) *</label>
                  <div className="space-y-2">
                    {cardForm.requirementsZh && Array.isArray(cardForm.requirementsZh) ? cardForm.requirementsZh.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateRequirementZh(index, e.target.value)}
                          placeholder={`条件 ${index + 1} (例如: 18岁以上)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {cardForm.requirementsZh.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRequirementZh(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addRequirementZh}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + 添加条件
                    </button>
                  </div>
                </div>
                
                {cardMessage && (
                  <div className={`p-3 rounded-lg ${
                    cardMessage.includes('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {cardMessage}
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={cardSubmitting}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {cardSubmitting ? (editingCardId ? '수정 중...' : '생성 중...') : (editingCardId ? '카드 수정' : '카드 생성')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // 모든 미리보기 URL 해제
                      if (cardForm.imagePreview) {
                        URL.revokeObjectURL(cardForm.imagePreview)
                      }
                      cardForm.imagePreviews.forEach(url => URL.revokeObjectURL(url))
                      
                      setCardForm({
                        activityType: '',
                        title: '',
                        titleEn: '',
                        titleZh: '',
                        category: '',
                        customCategory: '',
                        description: '',
                        descriptionEn: '',
                        descriptionZh: '',
                        maxParticipants: '',
                        experienceStartDate: '',
                        experienceEndDate: '',
                        recruitmentStartDate: '',
                        recruitmentEndDate: '',
                        location: '',
                        locationEn: '',
                        locationZh: '',
                        tags: [''],
                        tagsEn: [''],
                        tagsZh: [''],
                        benefits: [''],
                        benefitsEn: [''],
                        benefitsZh: [''],
                        requirements: [''],
                        requirementsEn: [''],
                        requirementsZh: [''],
                        image: null,
                        imagePreview: '',
                        images: [],
                        imagePreviews: []
                      })
                      setShowCustomCategory(false)
                      setCardMessage('')
                      setEditingCardId(null)
                      
                      // 수정 모드에서 돌아가기 버튼을 누르면 신청 카드 수정 탭으로 이동
                      if (editingCardId) {
                        setActiveTab('edit-cards')
                      }
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {editingCardId ? '돌아가기' : '초기화'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )

      case 'edit-cards':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">신청 카드 수정</h2>
              <p className="text-gray-600">기존 체험단 신청 카드를 수정하거나 삭제하세요</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">카드 목록</h3>
              
              {allExperiences.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">등록된 카드가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allExperiences.map((experience) => (
                    <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{experience.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                              getStatusByDate(experience) === 'recruiting' ? 'bg-green-100 text-green-800' :
                              getStatusByDate(experience) === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusByDate(experience) === 'recruiting' ? '모집중' :
                               getStatusByDate(experience) === 'ongoing' ? '진행중' : '완료'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{experience.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 {experience.date}</span>
                            <span>👥 {experience.maxParticipants}명</span>
                            <span>📍 {experience.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditCard(experience)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteCard(experience.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'excel-export':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">업체별 체험단 신청리스트</h2>
              <p className="text-gray-600">체험단 신청 데이터를 엑셀 파일로 다운로드할 수 있습니다</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">신청 데이터 관리</h3>
                <div className="flex gap-3">
                  <button
                    onClick={loadExcelData}
                    disabled={excelLoading}
                    className="bg-blue-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <RefreshCw className={`h-4 w-4 ${excelLoading ? 'animate-spin' : ''}`} />
                    {excelLoading ? '로딩 중...' : '데이터 새로고침'}
                  </button>
                  <button
                    onClick={handleExcelDownload}
                    disabled={excelData.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    엑셀 다운로드
                  </button>
                </div>
              </div>

              {excelMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  excelMessage.includes('성공') ? 'bg-green-50 text-green-700' : 
                  excelMessage.includes('실패') ? 'bg-red-50 text-red-700' : 
                  'bg-blue-50 text-blue-700'
                }`}>
                  {excelMessage}
                </div>
              )}

              {excelData.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">데이터 미리보기</h4>
                    <p className="text-sm text-gray-600 mb-3">총 {excelData.length}개의 신청 데이터가 있습니다.</p>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">신청자</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">체험단</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">상태</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">신청일</th>
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-3">
                                <div>
                                  <div className="font-medium text-gray-900">{row['신청자 이름']}</div>
                                  <div className="text-gray-500 text-xs">{row['신청자 이메일']}</div>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="font-medium text-gray-900">{row['체험단 제목']}</div>
                                <div className="text-gray-500 text-xs">{row['체험단 카테고리']}</div>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                  row['신청 상태'] === '승인' ? 'bg-green-100 text-green-800' :
                                  row['신청 상태'] === '거절' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {row['신청 상태']}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-600">{row['신청 일시']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {excelData.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        ... 외 {excelData.length - 5}개 더 (엑셀 파일에서 전체 데이터 확인 가능)
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">아직 데이터가 로드되지 않았습니다.</p>
                  <p className="text-sm text-gray-400">위의 &quot;데이터 새로고침&quot; 버튼을 클릭하여 신청 데이터를 불러오세요.</p>
                </div>
              )}
            </div>
          </div>
        )

      // 인스타그램 케이스들
      case 'instagram-dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">인스타그램 대시보드</h2>
                <p className="text-gray-600">인스타그램 체험단 현황을 한눈에 확인하세요</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    console.log('=== 인스타그램 데이터 확인 시작 ===')
                    try {
                      // Firestore 직접 조회
                      const { collection, getDocs } = await import('firebase/firestore')
                      const { db } = await import('@/lib/firebase')
                      
                      // instagram_experiences 컬렉션 확인
                      const experiencesRef = collection(db, 'instagram_experiences')
                      const experiencesSnapshot = await getDocs(experiencesRef)
                      console.log('instagram_experiences 컬렉션 문서 수:', experiencesSnapshot.docs.length)
                      experiencesSnapshot.docs.forEach((doc, index) => {
                        const data = doc.data()
                        console.log(`인스타그램 체험단 ${index + 1}:`, { 
                          id: doc.id, 
                          title: data.title, 
                          applicationsCount: data.applications?.length || 0,
                          applications: data.applications
                        })
                      })
                    } catch (error) {
                      console.error('인스타그램 데이터 확인 오류:', error)
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  🔍 데이터 확인
                </button>
                <button
                  onClick={() => {
                    loadInstagramData()
                  }}
                  disabled={instagramLoading}
                  className="bg-blue-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
                >
                  <RefreshCw className={`h-4 w-4 ${instagramLoading ? 'animate-spin' : ''}`} />
                  {instagramLoading ? '로딩 중...' : '전체 새로고침'}
                </button>
              </div>
            </div>
            
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 sm:p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">총 사용자</p>
                    <p className="text-3xl font-bold">{instagramUserStats.totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-pink-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">오늘 가입</p>
                    <p className="text-3xl font-bold">{instagramUserStats.todayUsers}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium">이번 주 가입</p>
                    <p className="text-3xl font-bold">{instagramUserStats.thisWeekUsers}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-indigo-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 rounded-xl text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-rose-100 text-sm font-medium">총 신청</p>
                    <p className="text-3xl font-bold">{instagramApplicationStats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-rose-200" />
                </div>
              </div>
            </div>

            {/* 신청 상태별 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">대기중</p>
                    <p className="text-2xl font-bold text-gray-900">{instagramApplicationStats.pending}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">승인</p>
                    <p className="text-2xl font-bold text-gray-900">{instagramApplicationStats.approved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">거절</p>
                    <p className="text-2xl font-bold text-gray-900">{instagramApplicationStats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 체험단 정보 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* 최근 인스타그램 체험단 목록 */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">최근 인스타그램 체험단</h3>
                  <span className="text-sm text-gray-500">{instagramRecentExperiences.length}개</span>
                </div>
                <div className="space-y-3">
                  {instagramRecentExperiences.length === 0 ? (
                    <div className="text-center py-4">
                      <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">인스타그램 체험단이 없습니다</p>
                    </div>
                  ) : (
                    instagramRecentExperiences.map((experience) => (
                      <div key={experience.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${
                          getStatusByDate(experience) === 'recruiting' ? 'bg-green-500' :
                          getStatusByDate(experience) === 'ongoing' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{experience.title}</p>
                          <p className="text-xs text-gray-500">
                            {instagramExperienceApplicationCounts[experience.id] !== undefined 
                              ? `${instagramExperienceApplicationCounts[experience.id]}/${experience.maxParticipants}명 참여`
                              : '신청인원 로딩중...'
                            }
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          getStatusByDate(experience) === 'recruiting' ? 'bg-green-100 text-green-800' :
                          getStatusByDate(experience) === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusByDate(experience) === 'recruiting' ? '모집중' :
                           getStatusByDate(experience) === 'ongoing' ? '진행중' : '완료'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 오늘 방문하는 인스타그램 체험단 */}
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">오늘 방문</h3>
                  <span className="text-sm text-gray-500">{instagramTodayExperiences.length}개</span>
                </div>
                <div className="space-y-3">
                  {instagramTodayExperiences.length === 0 ? (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">오늘 방문할 인스타그램 체험단이 없습니다</p>
                    </div>
                  ) : (
                    instagramTodayExperiences.map((experience) => (
                      <div key={experience.id} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{experience.title}</p>
                          <p className="text-xs text-gray-500">
                            {instagramExperienceApplicationCounts[experience.id] !== undefined 
                              ? `${instagramExperienceApplicationCounts[experience.id]}/${experience.maxParticipants}명 참여`
                              : '신청인원 로딩중...'
                            }
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                          긴급
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 'instagram-experiences':
        const instagramRecruitingExperiences = instagramAllExperiences.filter(exp => getStatusByDate(exp) === 'recruiting')
        const instagramOngoingExperiences = instagramAllExperiences.filter(exp => getStatusByDate(exp) === 'ongoing')
        const instagramCompletedExperiences = instagramAllExperiences.filter(exp => getStatusByDate(exp) === 'completed')

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">인스타그램 체험단 관리</h2>
              <p className="text-gray-600">인스타그램 체험단 활동을 관리하세요</p>
              {instagramExperienceMessage && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  instagramExperienceMessage.includes('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {instagramExperienceMessage}
                </div>
              )}
            </div>
            
            {/* 인스타그램 체험단 현황 통계 */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">인스타그램 체험단 현황</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">모집중</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-2">{instagramStats.recruiting}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">진행중</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{instagramStats.ongoing}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">완료</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600 mt-2">{instagramStats.completed}</p>
                </div>
              </div>
            </div>

            {/* 모집중인 인스타그램 체험단 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">모집중인 인스타그램 체험단</h3>
                  <span className="text-sm text-gray-500">{instagramRecruitingExperiences.length}개</span>
                </div>
              </div>
              <div className="p-6">
                {instagramExperiencesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">인스타그램 체험단을 불러오는 중...</span>
                  </div>
                ) : instagramRecruitingExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">모집중인 인스타그램 체험단이 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {instagramRecruitingExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{experience.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            getStatusByDate(experience) === 'recruiting' 
                              ? 'bg-green-100 text-green-800'
                              : getStatusByDate(experience) === 'ongoing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusByDate(experience) === 'recruiting' 
                              ? '모집중'
                              : getStatusByDate(experience) === 'ongoing'
                              ? '진행중'
                              : '완료'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="font-medium text-red-600">
                            {instagramExperienceApplicationCounts[experience.id] !== undefined 
                              ? `${instagramExperienceApplicationCounts[experience.id]} / ${experience.maxParticipants}명 모집`
                              : '신청인원 로딩중...'
                            }
                          </span>
                          <span>{experience.daysLeft}일 남음</span>
                        </div>
                        
                        {/* 상태 수정 및 삭제 버튼 */}
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => handleInstagramExperienceStatusUpdate(experience.id, e.target.value as 'recruiting' | 'ongoing' | 'completed')}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            defaultValue={getStatusByDate(experience)}
                          >
                            <option value="recruiting">모집중</option>
                            <option value="ongoing">진행중</option>
                            <option value="completed">완료</option>
                          </select>
                          <button
                            onClick={() => handleInstagramExperienceDelete(experience.id, experience.title)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 진행중인 인스타그램 체험단 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">진행중인 인스타그램 체험단</h3>
                  <span className="text-sm text-gray-500">{instagramOngoingExperiences.length}개</span>
                </div>
              </div>
              <div className="p-6">
                {instagramOngoingExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">진행중인 인스타그램 체험단이 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {instagramOngoingExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{experience.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            getStatusByDate(experience) === 'recruiting' 
                              ? 'bg-green-100 text-green-800'
                              : getStatusByDate(experience) === 'ongoing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusByDate(experience) === 'recruiting' 
                              ? '모집중'
                              : getStatusByDate(experience) === 'ongoing'
                              ? '진행중'
                              : '완료'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="font-medium text-red-600">
                            {instagramExperienceApplicationCounts[experience.id] !== undefined 
                              ? `${instagramExperienceApplicationCounts[experience.id]} / ${experience.maxParticipants}명 모집`
                              : '신청인원 로딩중...'
                            }
                          </span>
                          <span>{experience.daysLeft}일 남음</span>
                        </div>
                        
                        {/* 상태 수정 및 삭제 버튼 */}
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => handleInstagramExperienceStatusUpdate(experience.id, e.target.value as 'recruiting' | 'ongoing' | 'completed')}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            defaultValue={getStatusByDate(experience)}
                          >
                            <option value="recruiting">모집중</option>
                            <option value="ongoing">진행중</option>
                            <option value="completed">완료</option>
                          </select>
                          <button
                            onClick={() => handleInstagramExperienceDelete(experience.id, experience.title)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 완료된 인스타그램 체험단 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">완료된 인스타그램 체험단</h3>
                  <span className="text-sm text-gray-500">{instagramCompletedExperiences.length}개</span>
                </div>
              </div>
              <div className="p-6">
                {instagramCompletedExperiences.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">완료된 인스타그램 체험단이 없습니다</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {instagramCompletedExperiences.map((experience) => (
                      <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 line-clamp-1">{experience.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            getStatusByDate(experience) === 'recruiting' 
                              ? 'bg-green-100 text-green-800'
                              : getStatusByDate(experience) === 'ongoing'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusByDate(experience) === 'recruiting' 
                              ? '모집중'
                              : getStatusByDate(experience) === 'ongoing'
                              ? '진행중'
                              : '완료'
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{experience.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="font-medium text-red-600">
                            {instagramExperienceApplicationCounts[experience.id] !== undefined 
                              ? `${instagramExperienceApplicationCounts[experience.id]} / ${experience.maxParticipants}명 모집`
                              : '신청인원 로딩중...'
                            }
                          </span>
                          <span>완료됨</span>
                        </div>
                        
                        {/* 상태 수정 및 삭제 버튼 */}
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => handleInstagramExperienceStatusUpdate(experience.id, e.target.value as 'recruiting' | 'ongoing' | 'completed')}
                            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            defaultValue={getStatusByDate(experience)}
                          >
                            <option value="recruiting">모집중</option>
                            <option value="ongoing">진행중</option>
                            <option value="completed">완료</option>
                          </select>
                          <button
                            onClick={() => handleInstagramExperienceDelete(experience.id, experience.title)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'instagram-applications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">인스타그램 신청 관리</h2>
                <p className="text-gray-600">인스타그램 체험단 신청 현황을 관리하세요</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    console.log('=== 인스타그램 신청 관리 데이터 확인 시작 ===')
                    try {
                      // Firestore 직접 조회
                      const { collection, getDocs } = await import('firebase/firestore')
                      const { db } = await import('@/lib/firebase')
                      
                      // instagram_experiences 컬렉션의 applications 배열 확인
                      const experiencesRef = collection(db, 'instagram_experiences')
                      const experiencesSnapshot = await getDocs(experiencesRef)
                      experiencesSnapshot.docs.forEach((doc, index) => {
                        const data = doc.data()
                        console.log(`인스타그램 체험단 ${index + 1}:`, { 
                          id: doc.id, 
                          title: data.title, 
                          applicationsCount: data.applications?.length || 0
                        })
                        if (data.applications && data.applications.length > 0) {
                          console.log(`  신청서들:`, data.applications)
                        }
                      })
                    } catch (error) {
                      console.error('인스타그램 신청 관리 데이터 확인 오류:', error)
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                >
                  🔍 신청 데이터 확인
                </button>
                <button
                  onClick={() => {
                    loadInstagramApplications()
                  }}
                  disabled={applicationsLoading}
                  className="bg-blue-600 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm sm:text-base"
                >
                  <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
                  {applicationsLoading ? '로딩 중...' : '데이터 새로고침'}
                </button>
              </div>
            </div>
            

            {/* 인스타그램 신청 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <button 
                onClick={() => setInstagramApplicationFilter('all')}
                className={`bg-gradient-to-r from-pink-500 to-pink-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  instagramApplicationFilter === 'all' ? 'ring-4 ring-pink-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-100 text-sm font-medium">총 신청</p>
                    <p className="text-3xl font-bold">{instagramApplicationStats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-pink-200" />
                </div>
              </button>
              
              <button 
                onClick={() => setInstagramApplicationFilter('pending')}
                className={`bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  instagramApplicationFilter === 'pending' ? 'ring-4 ring-yellow-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">대기중</p>
                    <p className="text-3xl font-bold">{instagramApplicationStats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </button>
              
              <button 
                onClick={() => setInstagramApplicationFilter('approved')}
                className={`bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  instagramApplicationFilter === 'approved' ? 'ring-4 ring-green-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">승인됨</p>
                    <p className="text-3xl font-bold">{instagramApplicationStats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </button>
              
              <button 
                onClick={() => setInstagramApplicationFilter('rejected')}
                className={`bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                  instagramApplicationFilter === 'rejected' ? 'ring-4 ring-red-300 shadow-xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">거부됨</p>
                    <p className="text-3xl font-bold">{instagramApplicationStats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-200" />
                </div>
              </button>
            </div>

            {/* 인스타그램 신청서 목록 */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      인스타그램 신청서 목록
                      {instagramApplicationFilter !== 'all' && (
                        <span className="ml-2 text-sm font-normal text-gray-600">
                          ({instagramApplicationFilter === 'pending' ? '대기중' : 
                            instagramApplicationFilter === 'approved' ? '승인됨' : '거부됨'} 필터 적용)
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {(() => {
                        const filteredApplications = instagramApplicationFilter === 'all' 
                          ? instagramApplications 
                          : instagramApplications.filter(app => app.status === instagramApplicationFilter)
                        return `총 ${filteredApplications.length}개의 신청서`
                      })()}
                      {instagramApplications.filter(app => !app.name || !app.experienceTitle || !app.visitDate).length > 0 && (
                        <span className="ml-2 text-red-600 font-medium">
                          (이슈 {instagramApplications.filter(app => !app.name || !app.experienceTitle || !app.visitDate).length}개)
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={loadInstagramApplications}
                    disabled={applicationsLoading}
                    className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${applicationsLoading ? 'animate-spin' : ''}`} />
                    <span>새로고침</span>
                  </button>
                </div>
              </div>

              {instagramApplicationMessage && (
                <div className={`mx-6 mt-4 p-3 rounded-lg text-sm ${
                  instagramApplicationMessage.includes('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {instagramApplicationMessage}
                </div>
              )}

              <div className="p-6">
                {applicationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <span className="ml-2 text-gray-600">인스타그램 신청서를 불러오는 중...</span>
                  </div>
                ) : (() => {
                  const filteredApplications = instagramApplicationFilter === 'all' 
                    ? instagramApplications 
                    : instagramApplications.filter(app => app.status === instagramApplicationFilter)
                  
                  return filteredApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {instagramApplicationFilter === 'all' ? '인스타그램 신청서가 없습니다' : 
                         `${instagramApplicationFilter === 'pending' ? '대기중' : 
                           instagramApplicationFilter === 'approved' ? '승인됨' : '거부됨'} 신청서가 없습니다`}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredApplications.map((application) => {
                      // 오류가 있는 신청서 식별
                      const hasError = !application.name || !application.experienceTitle || !application.visitDate
                      return (
                      <div key={application.id} className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                        hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}>
                        <div className="space-y-4">
                          {/* 상단: 이름, 상태, 오류 표시 */}
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-gray-900 truncate">{application.name || '이름 없음'}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              application.status === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {application.status === 'pending' ? '대기중' :
                               application.status === 'approved' ? '승인됨' : '거부됨'}
                            </span>
                            {hasError && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 whitespace-nowrap">
                                오류
                              </span>
                            )}
                          </div>
                          
                          {/* 체험단 제목 */}
                          <p className="text-sm text-gray-600 truncate">{application.experienceTitle}</p>
                          
                          {/* 주요 정보 그리드 */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">방문일</div>
                              <div className="font-medium">{application.visitDate || '미입력'}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">방문시간</div>
                              <div className="font-medium">{application.visitTimePeriod} {application.visitTimeHour}:{application.visitTimeMinute}</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">인원</div>
                              <div className="font-medium">{application.visitCount}명</div>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <div className="text-gray-500 text-xs">팔로워</div>
                              <div className="font-medium">{application.followerCount.toLocaleString()}명</div>
                            </div>
                          </div>
                          
                          {/* 연락처 정보 */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">위쳇:</span>
                              <span className="font-medium text-gray-900">{application.wechatId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">인스타그램:</span>
                              <span className="font-medium text-gray-900">{application.xiaohongshuId}</span>
                            </div>
                          </div>
                          
                          {/* 액션 버튼들 - 가운데 정렬 */}
                          <div className="flex items-center justify-center space-x-2 pt-2 border-t border-gray-200">
                            {application.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleInstagramApplicationStatusUpdate(application.id!, 'approved')}
                                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleInstagramApplicationStatusUpdate(application.id!, 'rejected')}
                                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium whitespace-nowrap"
                                >
                                  거부
                                </button>
                              </>
                            )}
                            {application.status === 'approved' && (
                              <button
                                onClick={() => handleInstagramCancelApproval(application.id!)}
                                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium whitespace-nowrap"
                              >
                                승인 취소
                              </button>
                            )}
                            {application.status === 'rejected' && (
                              <button
                                onClick={() => handleInstagramCancelRejection(application.id!)}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
                              >
                                거부 취소
                              </button>
                            )}
                            <button
                              onClick={() => handleInstagramApplicationDelete(application.id!, application.name)}
                              className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium whitespace-nowrap"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )
              })()}
              </div>
            </div>
          </div>
        )

      case 'instagram-create-card':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">인스타그램 신청 카드 만들기</h2>
              <p className="text-gray-600">새로운 인스타그램 체험단 신청 카드를 생성하세요</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">카드 정보 입력</h3>
              <form onSubmit={handleInstagramCardSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">활동 유형 *</label>
                    <select 
                      value={instagramCardForm.activityType}
                      onChange={(e) => setInstagramCardForm({...instagramCardForm, activityType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">활동 유형 선택</option>
                      <option value="experience">체험단</option>
                      <option value="reporter">기자단</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목 (한국어) *</label>
                    <input
                      type="text"
                      value={instagramCardForm.title}
                      onChange={(e) => setInstagramCardForm({...instagramCardForm, title: e.target.value})}
                      placeholder="예: 하리 원장님 헤어 체험"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제목 (영어) *</label>
                    <input
                      type="text"
                      value={instagramCardForm.titleEn}
                      onChange={(e) => setInstagramCardForm({...instagramCardForm, titleEn: e.target.value})}
                      placeholder="예: Hair Experience with Dr. Ha"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                    <select 
                      value={instagramCardForm.category}
                      onChange={(e) => {
                        setInstagramCardForm({...instagramCardForm, category: e.target.value})
                        if (e.target.value === 'other') {
                          setInstagramShowCustomCategory(true)
                        } else {
                          setInstagramShowCustomCategory(false)
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">카테고리 선택</option>
                      <option value="beauty">뷰티</option>
                      <option value="restaurant">맛집</option>
                      <option value="dessert">디저트</option>
                      <option value="plastic-surgery">성형외과</option>
                      <option value="dermatology">피부과</option>
                      <option value="accommodation">숙박</option>
                      <option value="other">기타</option>
                    </select>
                  </div>
                </div>
                
                {/* 기타 카테고리 입력 필드 */}
                {instagramShowCustomCategory && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">기타 카테고리 입력</label>
                    <input
                      type="text"
                      value={instagramCardForm.customCategory}
                      onChange={(e) => setInstagramCardForm({...instagramCardForm, customCategory: e.target.value})}
                      placeholder="카테고리를 직접 입력하세요"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* 인스타그램 태그 입력 필드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">태그 (한국어)</label>
                    <div className="space-y-2">
                      {instagramCardForm.tags && Array.isArray(instagramCardForm.tags) ? instagramCardForm.tags.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateInstagramTag(index, e.target.value)}
                            placeholder="태그를 입력하세요"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeInstagramTag(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      )) : null}
                      <button
                        type="button"
                        onClick={addInstagramTag}
                        className="w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        + 태그 추가
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">태그 (영어)</label>
                    <div className="space-y-2">
                      {instagramCardForm.tagsEn && Array.isArray(instagramCardForm.tagsEn) ? instagramCardForm.tagsEn.map((tag, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={tag}
                            onChange={(e) => updateInstagramTagEn(index, e.target.value)}
                            placeholder="Enter tag"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeInstagramTagEn(index)}
                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )) : null}
                      <button
                        type="button"
                        onClick={addInstagramTagEn}
                        className="w-full py-2 px-4 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        + Add Tag
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 설명 (한국어) *</label>
                  <textarea
                    rows={4}
                    value={instagramCardForm.description}
                    onChange={(e) => setInstagramCardForm({...instagramCardForm, description: e.target.value})}
                    placeholder="체험단에 대한 자세한 설명을 입력하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 설명 (영어) *</label>
                  <textarea
                    rows={4}
                    value={instagramCardForm.descriptionEn}
                    onChange={(e) => setInstagramCardForm({...instagramCardForm, descriptionEn: e.target.value})}
                    placeholder="Please enter detailed description of the experience group..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">최대 참여자 수 *</label>
                    <input
                      type="number"
                      min="1"
                      value={instagramCardForm.maxParticipants}
                      onChange={(e) => setInstagramCardForm({...instagramCardForm, maxParticipants: e.target.value})}
                      placeholder="예: 10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">체험 기간 *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">시작일</label>
                        <input
                          type="date"
                          value={instagramCardForm.experienceStartDate}
                          onChange={(e) => setInstagramCardForm({...instagramCardForm, experienceStartDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">종료일</label>
                        <input
                          type="date"
                          value={instagramCardForm.experienceEndDate}
                          onChange={(e) => setInstagramCardForm({...instagramCardForm, experienceEndDate: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">모집 시작일 *</label>
                    <input
                      type="date"
                      value={instagramCardForm.recruitmentStartDate}
                      onChange={(e) => setInstagramCardForm({...instagramCardForm, recruitmentStartDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">모집 마감일 *</label>
                    <input
                      type="date"
                      value={instagramCardForm.recruitmentEndDate}
                      onChange={(e) => setInstagramCardForm({...instagramCardForm, recruitmentEndDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험 장소 (한국어) *</label>
                  <input
                    type="text"
                    value={instagramCardForm.location}
                    onChange={(e) => setInstagramCardForm({...instagramCardForm, location: e.target.value})}
                    placeholder="예: 서울 강남구 청담동 123-45"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험 장소 (영어) *</label>
                  <input
                    type="text"
                    value={instagramCardForm.locationEn}
                    onChange={(e) => setInstagramCardForm({...instagramCardForm, locationEn: e.target.value})}
                    placeholder="예: 123-45 Cheongdam-dong, Gangnam-gu, Seoul"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 이미지 (여러 장 선택 가능)</label>
                  <div className="space-y-4">
                    {/* 메인 이미지 미리보기 */}
                    {instagramCardForm.imagePreview && (
                      <div className="relative">
                        <div className="bg-pink-50 border border-pink-200 rounded-lg p-2 mb-2">
                          <span className="text-sm font-medium text-pink-700">메인 이미지 (카드에 표시)</span>
                        </div>
                        <img
                          src={instagramCardForm.imagePreview}
                          alt="메인 이미지 미리보기"
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleInstagramImageRemove}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    {/* 모든 이미지 미리보기 */}
                    {instagramCardForm.imagePreviews.length > 0 && (
                      <div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                          <span className="text-sm font-medium text-green-700">상세 페이지 이미지들 ({instagramCardForm.imagePreviews.length}장)</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {instagramCardForm.imagePreviews && Array.isArray(instagramCardForm.imagePreviews) ? instagramCardForm.imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`이미지 ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleInstagramImageRemoveAt(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs"
                              >
                                ×
                              </button>
                              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          )) : null}
                        </div>
                        <button
                          type="button"
                          onClick={handleInstagramAllImagesRemove}
                          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                        >
                          모든 이미지 제거
                        </button>
                      </div>
                    )}
                    
                    {/* 파일 업로드 */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleInstagramMultipleImageUpload}
                        className="hidden"
                        id="instagram-multiple-image-upload"
                      />
                      <label
                        htmlFor="instagram-multiple-image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-pink-600 hover:text-pink-500">클릭하여 여러 이미지 업로드</span>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (최대 5MB, 여러 장 선택 가능)</p>
                          <p className="text-xs text-gray-500">첫 번째 이미지는 카드에, 모든 이미지는 상세 페이지에 표시됩니다</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 혜택 (한국어) *</label>
                  <div className="space-y-2">
                    {instagramCardForm.benefits && Array.isArray(instagramCardForm.benefits) ? instagramCardForm.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateInstagramBenefit(index, e.target.value)}
                          placeholder={`혜택 ${index + 1} (예: 무료 체험 제공)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        {instagramCardForm.benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstagramBenefit(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addInstagramBenefit}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + 혜택 추가
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">체험단 혜택 (영어) *</label>
                  <div className="space-y-2">
                    {instagramCardForm.benefitsEn && Array.isArray(instagramCardForm.benefitsEn) ? instagramCardForm.benefitsEn.map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateInstagramBenefitEn(index, e.target.value)}
                          placeholder={`Benefit ${index + 1} (e.g., Free product)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        {instagramCardForm.benefitsEn.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstagramBenefitEn(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addInstagramBenefitEn}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + Add Benefit
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">참여 조건 (한국어) *</label>
                  <div className="space-y-2">
                    {instagramCardForm.requirements && Array.isArray(instagramCardForm.requirements) ? instagramCardForm.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateInstagramRequirement(index, e.target.value)}
                          placeholder={`조건 ${index + 1} (예: 만 18세 이상)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        {instagramCardForm.requirements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstagramRequirement(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addInstagramRequirement}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + 조건 추가
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">참여 조건 (영어) *</label>
                  <div className="space-y-2">
                    {instagramCardForm.requirementsEn && Array.isArray(instagramCardForm.requirementsEn) ? instagramCardForm.requirementsEn.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={requirement}
                          onChange={(e) => updateInstagramRequirementEn(index, e.target.value)}
                          placeholder={`Requirement ${index + 1} (e.g., Age 18+)`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        {instagramCardForm.requirementsEn.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstagramRequirementEn(index)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )) : null}
                    <button
                      type="button"
                      onClick={addInstagramRequirementEn}
                      className="w-full px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors border-2 border-dashed border-green-300"
                    >
                      + Add Requirement
                    </button>
                  </div>
                </div>
                
                {instagramCardMessage && (
                  <div className={`p-3 rounded-lg ${
                    instagramCardMessage.includes('성공') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {instagramCardMessage}
                  </div>
                )}
                
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={instagramCardSubmitting}
                    className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                  >
                    {instagramCardSubmitting ? (instagramEditingCardId ? '수정 중...' : '생성 중...') : (instagramEditingCardId ? '카드 수정' : '카드 생성')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // 모든 미리보기 URL 해제
                      if (instagramCardForm.imagePreview) {
                        URL.revokeObjectURL(instagramCardForm.imagePreview)
                      }
                      instagramCardForm.imagePreviews.forEach(url => URL.revokeObjectURL(url))
                      
                      setInstagramCardForm({
                        activityType: '',
                        title: '',
                        titleEn: '',
                        titleZh: '',
                        category: '',
                        customCategory: '',
                        description: '',
                        descriptionEn: '',
                        descriptionZh: '',
                        maxParticipants: '',
                        experienceStartDate: '',
                        experienceEndDate: '',
                        recruitmentStartDate: '',
                        recruitmentEndDate: '',
                        location: '',
                        locationEn: '',
                        locationZh: '',
                        tags: [''],
                        tagsEn: [''],
                        benefits: [''],
                        benefitsEn: [''],
                        benefitsZh: [''],
                        requirements: [''],
                        requirementsEn: [''],
                        requirementsZh: [''],
                        image: null,
                        imagePreview: '',
                        images: [],
                        imagePreviews: []
                      })
                      setInstagramShowCustomCategory(false)
                      setInstagramCardMessage('')
                      setInstagramEditingCardId(null)
                      
                      // 수정 모드에서 돌아가기 버튼을 누르면 신청 카드 수정 탭으로 이동
                      if (instagramEditingCardId) {
                        setActiveTab('instagram-edit-cards')
                      }
                    }}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    {instagramEditingCardId ? '돌아가기' : '초기화'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )

      case 'instagram-edit-cards':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">인스타그램 신청 카드 수정</h2>
              <p className="text-gray-600">기존 인스타그램 체험단 신청 카드를 수정하거나 삭제하세요</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">인스타그램 카드 목록</h3>
              
              {instagramAllExperiences.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">등록된 인스타그램 카드가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {instagramAllExperiences.map((experience) => (
                    <div key={experience.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{experience.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                              getStatusByDate(experience) === 'recruiting' ? 'bg-green-100 text-green-800' :
                              getStatusByDate(experience) === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusByDate(experience) === 'recruiting' ? '모집중' :
                               getStatusByDate(experience) === 'ongoing' ? '진행중' : '완료'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{experience.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 {experience.date}</span>
                            <span>👥 {experience.maxParticipants}명</span>
                            <span>📍 {experience.location}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleInstagramEditCard(experience)}
                            className="bg-pink-500 text-white px-3 py-1 rounded text-sm hover:bg-pink-600 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleInstagramDeleteCard(experience.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 'instagram-excel-export':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">인스타그램 업체별 체험단 신청리스트</h2>
              <p className="text-gray-600">인스타그램 체험단 신청 데이터를 엑셀 파일로 다운로드할 수 있습니다</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">인스타그램 신청 데이터 관리</h3>
                <div className="flex gap-3">
                  <button
                    onClick={loadInstagramExcelData}
                    disabled={instagramExcelLoading}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${instagramExcelLoading ? 'animate-spin' : ''}`} />
                    {instagramExcelLoading ? '로딩 중...' : '데이터 새로고침'}
                  </button>
                  <button
                    onClick={handleInstagramExcelDownload}
                    disabled={instagramExcelData.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    엑셀 다운로드
                  </button>
                </div>
              </div>

              {instagramExcelMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  instagramExcelMessage.includes('성공') ? 'bg-green-50 text-green-700' : 
                  instagramExcelMessage.includes('실패') ? 'bg-red-50 text-red-700' : 
                  'bg-blue-50 text-blue-700'
                }`}>
                  {instagramExcelMessage}
                </div>
              )}

              {instagramExcelData.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">인스타그램 데이터 미리보기</h4>
                    <p className="text-sm text-gray-600 mb-3">총 {instagramExcelData.length}개의 인스타그램 신청 데이터가 있습니다.</p>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">신청자</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">체험단</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">상태</th>
                            <th className="text-left py-2 px-3 font-semibold text-gray-700">신청일</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instagramExcelData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-2 px-3">
                                <div>
                                  <div className="font-medium text-gray-900">{row['신청자 이름']}</div>
                                  <div className="text-gray-500 text-xs">{row['신청자 이메일']}</div>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <div className="font-medium text-gray-900">{row['체험단 제목']}</div>
                                <div className="text-gray-500 text-xs">{row['체험단 카테고리']}</div>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                                  row['신청 상태'] === '승인' ? 'bg-green-100 text-green-800' :
                                  row['신청 상태'] === '거절' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {row['신청 상태']}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-600">{row['신청 일시']}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {instagramExcelData.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        ... 외 {instagramExcelData.length - 5}개 더 (엑셀 파일에서 전체 데이터 확인 가능)
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">아직 인스타그램 데이터가 로드되지 않았습니다.</p>
                  <p className="text-sm text-gray-400">위의 &quot;데이터 새로고침&quot; 버튼을 클릭하여 인스타그램 신청 데이터를 불러오세요.</p>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <div className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0 min-h-full">
        {/* 상단 로고 영역 */}
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">관리자</h1>
              <p className="text-sm text-gray-500">{t('site.title')}</p>
            </div>
          </div>
        </div>
        
        {/* 네비게이션 메뉴 */}
        <nav className="flex-1 px-0 overflow-y-auto">
          {sidebarItems.map((item) => {
            if (item.isDivider) {
              return <div key={item.id} className="h-4"></div>
            }
            
            if (item.isHeader) {
              // 사용자 관리는 독립적인 메뉴로 처리
              if (item.id === 'users') {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              }
              
              // 다른 헤더들은 섹션 제목으로 표시
              return (
                <div key={item.id} className="px-6 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </h3>
                </div>
              )
            }
            
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {Icon && <Icon className="h-5 w-5" />}
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
        
        {/* 하단 체험단 돌아가기 버튼 */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">체험단 돌아가기</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-8">
        {renderContent()}
      </div>
    </div>
  )
}