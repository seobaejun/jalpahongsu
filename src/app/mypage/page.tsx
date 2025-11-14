'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { db } from '@/lib/firebase'
import { Application } from '@/lib/applicationService'
import { User, Calendar, FileText, Settings, LogOut } from 'lucide-react'

interface UserApplication {
  id: string
  experienceId: string // 체험단 ID 추가
  experienceTitle: string
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
  visitDate: string
  visitTime: string
  visitorCount: number
  platform: 'xiaohongshu' | 'instagram' // 플랫폼 정보 추가
}

export default function MyPage() {
  const { user, userProfile, isAuthenticated, loading } = useAuth()
  const { t, currentLanguage } = useLanguage()
  const router = useRouter()

  // 체험단 제목 번역 함수
  const translateTitle = (title: string) => {
    console.log('번역 함수 호출:', { title, currentLanguage })
    
    if (currentLanguage === 'ko') return title

    const translations: { [key: string]: string } = {
      // 실제 Firestore 데이터에 맞춘 번역
      '【주말 방문 가능】보승회관 신사역점': '【周末可访问】保胜会馆新沙站店',
      '하리 원장님_헤어(고바이씬 헤어살롱)': '河利院长_头发(高拜新头发沙龙)',
      '성형외과': '整形外科',
      '천안맛집': '天安美食',
      '강남 맛집': '江南美食',
      '뷰티': '美容',
      'MARITHE 광장시장점': 'MARITHE广藏市场店',
      '【REVU 포인트_5만】TERRA LIGHT 무설탕 맥주': '【REVU积分_5万】TERRA LIGHT无糖啤酒',
      '【주말 방문 가능】서울88맥주': '【周末可访问】首尔88啤酒',
      '서울랜드 방문': '首尔乐园访问',
    }

    const translated = translations[title] || title
    console.log('번역 결과:', { original: title, translated })
    return translated
  }
  const [applications, setApplications] = useState<UserApplication[]>([])
  const [applicationsLoading, setApplicationsLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      // 사용자 프로필이 로드될 때까지 잠시 대기
      const timer = setTimeout(() => {
        loadUserApplications()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, user, loading, userProfile])

  const loadUserApplications = async () => {
    try {
      setApplicationsLoading(true)
      console.log('=== 마이페이지 신청 내역 로딩 시작 ===')
      console.log('현재 사용자 정보:', {
        user: user?.displayName,
        userProfile: userProfile?.displayName,
        email: user?.email,
        uid: user?.uid
      })
      
      const { collection, getDocs } = await import('firebase/firestore')
      
      // 모든 체험단에서 사용자의 신청서 찾기 (일반 체험단 + 인스타그램 체험단)
      const userApplications: UserApplication[] = []
      const currentUserName = userProfile?.displayName || user?.displayName || ''
      
      // 사용자 이름 비교를 위한 상세 로그
      console.log('현재 사용자 이름 (매칭용):', `"${currentUserName}"`)
      console.log('사용자 이름 길이:', currentUserName?.length)
      console.log('사용자 이름 타입:', typeof currentUserName)
      
      if (!currentUserName || currentUserName.trim() === '') {
        console.warn('사용자 이름이 없습니다. 신청 내역을 찾을 수 없습니다.')
        console.log('사용자 프로필 상태:', {
          userProfile: userProfile,
          user: user,
          loading: loading,
          isAuthenticated: isAuthenticated,
          currentUserName: currentUserName
        })
        
        // 사용자 프로필이 아직 로딩 중일 수 있으므로 잠시 후 다시 시도
        if (loading) {
          console.log('사용자 프로필 로딩 중... 잠시 후 다시 시도합니다.')
          setTimeout(() => {
            loadUserApplications()
          }, 2000)
          return
        }
        
        setApplications([])
        setUserStats({
          totalApplications: 0,
          approvedApplications: 0,
          pendingApplications: 0,
          rejectedApplications: 0
        })
        return
      }

      // 일반 체험단에서 신청서 찾기
      console.log('=== 일반 체험단에서 신청서 검색 ===')
      const experiencesRef = collection(db, 'experiences')
      const experiencesSnapshot = await getDocs(experiencesRef)
      console.log('일반 체험단 문서 수:', experiencesSnapshot.docs.length)
      
      // 각 체험단 문서의 구조 확인
      experiencesSnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        console.log(`일반 체험단 ${index + 1} 구조:`, {
          id: doc.id,
          title: data.title,
          hasApplications: !!data.applications,
          applicationsCount: data.applications?.length || 0,
          applications: data.applications?.map((app: any) => ({
            name: app.name,
            status: app.status,
            createdAt: app.createdAt
          })) || []
        })
      })
      
      experiencesSnapshot.docs.forEach((doc, docIndex) => {
        const experienceData = doc.data()
        const applications = experienceData.applications || []
        
        console.log(`일반 체험단 ${docIndex + 1}: "${experienceData.title}"의 신청서 수:`, applications.length)
        
        if (applications.length > 0) {
          console.log('신청서 목록:', applications.map((app: Application) => ({
            name: app.name,
            status: app.status,
            createdAt: app.createdAt
          })))
        }
        
        // 현재 사용자의 신청서만 필터링 (사용자 이름으로 매칭)
        const userApps = applications.filter((app: Application) => {
          console.log('신청서 이름 비교:', {
            appName: `"${app.name}"`,
            currentUserName: `"${currentUserName}"`,
            appNameLength: app.name?.length,
            currentUserNameLength: currentUserName?.length,
            isExactMatch: app.name === currentUserName,
            appNameType: typeof app.name,
            currentUserNameType: typeof currentUserName,
            userId: user?.uid,
            appUserId: (app as any).userId
          })
          
          // 이름으로 매칭 또는 사용자 ID로 매칭
          const isNameMatch = app.name === currentUserName
          const isUserIdMatch = (app as any).userId === user?.uid
          const isMatch = isNameMatch || isUserIdMatch
          
          if (isMatch) {
            console.log('✅ 매칭된 신청서 발견:', {
              experienceTitle: experienceData.title,
              userName: app.name,
              status: app.status,
              createdAt: app.createdAt,
              matchType: isNameMatch ? 'name' : 'userId'
            })
          } else {
            console.log('❌ 매칭되지 않은 신청서:', {
              experienceTitle: experienceData.title,
              userName: app.name,
              currentUserName: currentUserName,
              userId: user?.uid,
              appUserId: (app as any).userId
            })
          }
          return isMatch
        })
        
        console.log(`사용자 "${currentUserName}"의 매칭된 신청서 수:`, userApps.length)
        
        userApps.forEach((app: Application, appIndex: number) => {
          // Firestore Timestamp를 Date로 변환
          let createdAt: Date | null = null
          console.log('createdAt 원본 데이터:', app.createdAt, typeof app.createdAt)
          
          if (app.createdAt) {
            if (app.createdAt instanceof Date) {
              createdAt = app.createdAt
            } else if (app.createdAt && typeof app.createdAt === 'object' && 'toDate' in app.createdAt) {
              // Firestore Timestamp인 경우
              createdAt = (app.createdAt as any).toDate()
            } else {
              // 문자열이나 숫자인 경우
              createdAt = new Date(app.createdAt)
            }
            console.log('Date로 변환:', createdAt)
          }
          
          const userApp: UserApplication = {
            id: `exp_${doc.id}_${app.id || app.name}_${appIndex}`,
            experienceId: doc.id, // 체험단 ID 저장
            experienceTitle: experienceData.title, // 원본 제목 저장
            status: app.status || 'pending',
            appliedAt: createdAt ? createdAt.toLocaleDateString('ko-KR') : t('mypage.unknown'),
            visitDate: app.visitDate || t('mypage.undecided'),
            visitTime: app.visitTime || t('mypage.undecided'),
            visitorCount: parseInt(app.visitCount) || 1,
            platform: 'xiaohongshu' // 샤오홍슈 플랫폼
          }
          
          console.log('추가된 신청 내역:', userApp)
          userApplications.push(userApp)
        })
      })

      // 인스타그램 체험단에서 신청서 찾기
      console.log('=== 인스타그램 체험단에서 신청서 검색 ===')
      const instagramExperiencesRef = collection(db, 'instagram_experiences')
      const instagramSnapshot = await getDocs(instagramExperiencesRef)
      console.log('인스타그램 체험단 문서 수:', instagramSnapshot.docs.length)
      
      // 각 인스타그램 체험단 문서의 구조 확인
      instagramSnapshot.docs.forEach((doc, index) => {
        const data = doc.data()
        console.log(`인스타그램 체험단 ${index + 1} 구조:`, {
          id: doc.id,
          title: data.title,
          hasApplications: !!data.applications,
          applicationsCount: data.applications?.length || 0,
          applications: data.applications?.map((app: any) => ({
            name: app.name,
            status: app.status,
            createdAt: app.createdAt
          })) || []
        })
      })
      
      instagramSnapshot.docs.forEach((doc, docIndex) => {
        const experienceData = doc.data()
        const applications = experienceData.applications || []
        
        console.log(`인스타그램 체험단 ${docIndex + 1}: "${experienceData.title}"의 신청서 수:`, applications.length)
        
        if (applications.length > 0) {
          console.log('신청서 목록:', applications.map((app: Application) => ({
            name: app.name,
            status: app.status,
            createdAt: app.createdAt
          })))
        }
        
        // 현재 사용자의 신청서만 필터링 (사용자 이름으로 매칭)
        const userApps = applications.filter((app: Application) => {
          console.log('인스타그램 신청서 이름 비교:', {
            appName: `"${app.name}"`,
            currentUserName: `"${currentUserName}"`,
            appNameLength: app.name?.length,
            currentUserNameLength: currentUserName?.length,
            isExactMatch: app.name === currentUserName,
            appNameType: typeof app.name,
            currentUserNameType: typeof currentUserName,
            userId: user?.uid,
            appUserId: (app as any).userId
          })
          
          // 이름으로 매칭 또는 사용자 ID로 매칭
          const isNameMatch = app.name === currentUserName
          const isUserIdMatch = (app as any).userId === user?.uid
          const isMatch = isNameMatch || isUserIdMatch
          
          if (isMatch) {
            console.log('✅ 인스타그램 매칭된 신청서 발견:', {
              experienceTitle: experienceData.title,
              userName: app.name,
              status: app.status,
              createdAt: app.createdAt,
              matchType: isNameMatch ? 'name' : 'userId'
            })
          } else {
            console.log('❌ 인스타그램 매칭되지 않은 신청서:', {
              experienceTitle: experienceData.title,
              userName: app.name,
              currentUserName: currentUserName,
              userId: user?.uid,
              appUserId: (app as any).userId
            })
          }
          return isMatch
        })
        
        console.log(`인스타그램 사용자 "${currentUserName}"의 매칭된 신청서 수:`, userApps.length)
        
        userApps.forEach((app: Application, appIndex: number) => {
          // Firestore Timestamp를 Date로 변환
          let createdAt: Date | null = null
          console.log('인스타그램 createdAt 원본 데이터:', app.createdAt, typeof app.createdAt)
          
          if (app.createdAt) {
            if (app.createdAt instanceof Date) {
              createdAt = app.createdAt
            } else if (app.createdAt && typeof app.createdAt === 'object' && 'toDate' in app.createdAt) {
              // Firestore Timestamp인 경우
              createdAt = (app.createdAt as any).toDate()
            } else {
              // 문자열이나 숫자인 경우
              createdAt = new Date(app.createdAt)
            }
            console.log('인스타그램 Date로 변환:', createdAt)
          }
          
          const userApp: UserApplication = {
            id: `ig_${doc.id}_${app.id || app.name}_${appIndex}`,
            experienceId: doc.id, // 체험단 ID 저장
            experienceTitle: experienceData.title, // 원본 제목 저장
            status: app.status || 'pending',
            appliedAt: createdAt ? createdAt.toLocaleDateString('ko-KR') : t('mypage.unknown'),
            visitDate: app.visitDate || t('mypage.undecided'),
            visitTime: app.visitTime || t('mypage.undecided'),
            visitorCount: parseInt(app.visitCount) || 1,
            platform: 'instagram' // 인스타그램 플랫폼
          }
          
          console.log('추가된 인스타그램 신청 내역:', userApp)
          userApplications.push(userApp)
        })
      })
      
      console.log('=== 최종 신청 내역 ===')
      console.log('총 신청 수:', userApplications.length)
      console.log('신청 내역 목록:', userApplications)
      
      // 신청 내역을 최신순으로 정렬 (appliedAt 기준)
      const sortedApplications = userApplications.sort((a, b) => {
        const dateA = new Date(a.appliedAt.replace(/\./g, '-'))
        const dateB = new Date(b.appliedAt.replace(/\./g, '-'))
        return dateB.getTime() - dateA.getTime() // 최신순
      })
      
      console.log('정렬된 신청 내역:', sortedApplications)
      
      // 신청 내역이 있는 경우에만 설정
      if (sortedApplications.length > 0) {
        console.log('✅ 신청 내역을 설정합니다:', sortedApplications.length, '개')
        setApplications(sortedApplications)
      } else {
        console.log('❌ 신청 내역이 없어서 빈 배열로 설정합니다')
        setApplications([])
      }
      
      // 통계 계산
      const stats = {
        totalApplications: sortedApplications.length,
        approvedApplications: sortedApplications.filter(app => app.status === 'approved').length,
        pendingApplications: sortedApplications.filter(app => app.status === 'pending').length,
        rejectedApplications: sortedApplications.filter(app => app.status === 'rejected').length
      }
      
      console.log('사용자 통계:', stats)
      setUserStats(stats)
    } catch (error) {
      console.error('사용자 신청서 로딩 오류:', error)
    } finally {
      setApplicationsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return t('mypage.status.approved')
      case 'rejected':
        return t('mypage.status.rejected')
      case 'pending':
      default:
        return t('mypage.status.pending')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-600">{t('mypage.loading')}</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* {t('mypage.header')} */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('nav.welcome')}, {userProfile?.displayName || user?.displayName || t('nav.user')}{t('nav.honorific')}
              </h1>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* {t('mypage.stats')} */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('mypage.totalApplications')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('mypage.approvedApplications')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.approvedApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Settings className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('mypage.pendingApplications')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{t('mypage.rejectedApplications')}</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.rejectedApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* {t('mypage.applications')} */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('mypage.applications')}</h2>
            <p className="text-gray-600 mt-1">{t('mypage.applicationsDescription')}</p>
          </div>
          
          <div className="p-6">
            {applicationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <span className="ml-2 text-gray-600">{t('mypage.loading')}</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">신청 내역이 없습니다</h3>
                <p className="text-gray-600 mb-4">
                  아직 신청한 체험단이 없습니다. 
                  <br />
                  다양한 체험단에 참여해보세요!
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  체험단 둘러보기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div 
                    key={application.id} 
                    onClick={() => {
                      // 플랫폼에 따라 다른 경로로 이동
                      if (application.platform === 'xiaohongshu') {
                        router.push(`/experiences/${application.experienceId}`)
                      } else {
                        router.push(`/instagram/experiences/${application.experienceId}`)
                      }
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 hover:text-red-600 transition-colors">
                            {translateTitle(application.experienceTitle)}
                          </h3>
                          {/* 플랫폼 표시 */}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            application.platform === 'xiaohongshu' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {application.platform === 'xiaohongshu' ? '샤오홍슈' : '인스타그램'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">{t('mypage.appliedDate')}:</span> {application.appliedAt}
                          </div>
                          <div>
                            <span className="font-medium">{t('mypage.visitDate')}:</span> {application.visitDate}
                          </div>
                          <div>
                            <span className="font-medium">{t('mypage.visitTime')}:</span> {application.visitTime}
                          </div>
                          <div>
                            <span className="font-medium">{t('mypage.visitorCount')}:</span> {application.visitorCount}{t('mypage.people')}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                        <span className="text-xs text-gray-500">클릭하여 상세보기</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* {t('mypage.goHomeButton')} */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            {t('mypage.goHome')}
          </button>
        </div>
      </div>
    </div>
  )
}
