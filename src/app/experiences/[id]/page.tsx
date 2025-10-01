'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { submitApplication, getApplicationsByExperience } from '@/lib/applicationService'
import { Experience } from '@/types/database'
import { ArrowLeft, Calendar, Users, MapPin, Clock, Star, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import ImageSkeleton from '@/components/ImageSkeleton'


export default function ExperienceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { t, currentLanguage } = useLanguage()

  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applicationCount, setApplicationCount] = useState(0)
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([])
  const [formData, setFormData] = useState({
    name: '',
    passportNumber: '',
    visitDate: '',
    visitTimePeriod: '',
    visitTimeHour: '',
    visitTimeMinute: '',
    visitCount: '',
    wechatId: '',
    xiaohongshuId: '',
    followerCount: ''
  })
  const [submitMessage, setSubmitMessage] = useState('')

  // 언어별 데이터 계산
  const displayTitle = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.titleZh) {
      console.log('중국어 제목 사용:', experience.titleZh);
      return experience.titleZh;
    }
    console.log('한국어 제목 사용:', experience?.title);
    return experience?.title || '';
  }, [currentLanguage, experience?.title, experience?.titleZh]);

  const displayDescription = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.descriptionZh) {
      console.log('중국어 설명 사용:', experience.descriptionZh);
      return experience.descriptionZh;
    }
    console.log('한국어 설명 사용:', experience?.description);
    return experience?.description || '';
  }, [currentLanguage, experience?.description, experience?.descriptionZh]);

  const displayLocation = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.locationZh) {
      console.log('중국어 장소 사용:', experience.locationZh);
      return experience.locationZh;
    }
    console.log('한국어 장소 사용:', experience?.location);
    return experience?.location || '';
  }, [currentLanguage, experience?.location, experience?.locationZh]);

  const displayBenefits = useMemo(() => {
    console.log('혜택 섹션 렌더링:', { 
      currentLanguage, 
      benefits: experience?.benefits, 
      benefitsZh: experience?.benefitsZh 
    });
    
    let benefits = experience?.benefits;
    
    // 중국어일 때는 중국어 혜택 우선 사용
    if (currentLanguage === 'zh') {
      if (experience?.benefitsZh && experience.benefitsZh.length > 0) {
        benefits = experience.benefitsZh;
        console.log('중국어 혜택 사용:', benefits);
      } else {
        console.log('중국어 혜택이 없어서 한국어 혜택 사용:', experience?.benefits);
      }
    } else {
      console.log('한국어 혜택 사용:', experience?.benefits);
    }
    
    return benefits || [];
  }, [currentLanguage, experience?.benefits, experience?.benefitsZh]);

  const displayRequirements = useMemo(() => {
    console.log('참여 조건 섹션 렌더링:', { 
      currentLanguage, 
      requirements: experience?.requirements, 
      requirementsZh: experience?.requirementsZh 
    });
    
    let requirements = experience?.requirements;
    
    // 중국어일 때는 중국어 조건 우선 사용
    if (currentLanguage === 'zh') {
      if (experience?.requirementsZh && experience.requirementsZh.length > 0) {
        requirements = experience.requirementsZh;
        console.log('중국어 조건 사용:', requirements);
      } else {
        console.log('중국어 조건이 없어서 한국어 조건 사용:', experience?.requirements);
      }
    } else {
      console.log('한국어 조건 사용:', experience?.requirements);
    }
    
    return requirements || [];
  }, [currentLanguage, experience?.requirements, experience?.requirementsZh]);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true)
        const docRef = doc(db, 'experiences', params.id as string)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          
          // Firestore Timestamp를 안전하게 Date로 변환
          let createdAt: Date | null = null
          let updatedAt: Date | null = null
          
          if (data.createdAt) {
            try {
              if (data.createdAt instanceof Date) {
                createdAt = data.createdAt
              } else if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
                createdAt = data.createdAt.toDate()
              } else if (typeof data.createdAt === 'string') {
                createdAt = new Date(data.createdAt)
              } else if (data.createdAt.seconds) {
                createdAt = new Date(data.createdAt.seconds * 1000)
              }
            } catch (error) {
              console.error('createdAt 변환 오류:', error)
            }
          }
          
          if (data.updatedAt) {
            try {
              if (data.updatedAt instanceof Date) {
                updatedAt = data.updatedAt
              } else if (data.updatedAt.toDate && typeof data.updatedAt.toDate === 'function') {
                updatedAt = data.updatedAt.toDate()
              } else if (typeof data.updatedAt === 'string') {
                updatedAt = new Date(data.updatedAt)
              } else if (data.updatedAt.seconds) {
                updatedAt = new Date(data.updatedAt.seconds * 1000)
              }
            } catch (error) {
              console.error('updatedAt 변환 오류:', error)
            }
          }
          
          const experienceData = { 
            id: docSnap.id, 
            ...data,
            createdAt: createdAt,
            updatedAt: updatedAt
          } as Experience
          console.log('원본 데이터 로드:', { 
            title: experienceData.title, 
            titleZh: experienceData.titleZh,
            benefits: experienceData.benefits,
            benefitsZh: experienceData.benefitsZh,
            requirements: experienceData.requirements,
            requirementsZh: experienceData.requirementsZh,
            createdAt: experienceData.createdAt,
            currentLanguage 
          })
          setExperience(experienceData)
          
          // 이미지 로딩 상태 초기화
          setImageLoaded(new Array(experienceData.images?.length || 0).fill(false))
          
          // 신청자 수 가져오기
          const applicationsResult = await getApplicationsByExperience(params.id as string)
          if (applicationsResult.success) {
            setApplicationCount(applicationsResult.applications.length)
          }
        } else {
          console.log('체험단을 찾을 수 없습니다')
          router.push('/')
        }
      } catch (error) {
        console.error('체험단 정보 로딩 오류:', error)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchExperience()
    }
  }, [params.id, router, currentLanguage])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // 신청 폼 섹션으로 스크롤
    const formSection = document.getElementById('application-form')
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('샤오홍슈 신청서 제출 시작')
    console.log('인증 상태:', isAuthenticated)
    console.log('사용자 정보:', user)
    
    if (!isAuthenticated) {
      console.log('인증되지 않음 - 로그인 페이지로 이동')
      router.push('/login')
      return
    }

    if (!experience) {
      console.log('체험단 정보 없음')
      return
    }

    try {
      setApplying(true)
      setSubmitMessage('')

      const applicationData = {
        experienceId: experience.id,
        experienceTitle: experience.title,
        name: formData.name,
        passportNumber: formData.passportNumber,
        visitDate: formData.visitDate,
        visitTime: `${formData.visitTimeHour}:${formData.visitTimeMinute}`,
        visitTimePeriod: formData.visitTimePeriod,
        visitTimeHour: formData.visitTimeHour,
        visitTimeMinute: formData.visitTimeMinute,
        visitCount: formData.visitCount,
        wechatId: formData.wechatId,
        xiaohongshuId: formData.xiaohongshuId,
        followerCount: formData.followerCount,
        userId: user?.uid || '', // 사용자 ID 추가
        status: 'pending' as const
      }

      console.log('제출할 신청서 데이터:', applicationData)

      const result = await submitApplication(applicationData)
      
      console.log('신청서 제출 결과:', result)
      
      if (result.success) {
        setApplied(true)
        setSubmitMessage('신청이 성공적으로 제출되었습니다!')
        
        // 신청자 수 업데이트
        const applicationsResult = await getApplicationsByExperience(experience.id)
        if (applicationsResult.success) {
          setApplicationCount(applicationsResult.applications.length)
        }
        
        // 페이지 새로고침으로 카드 업데이트
        setTimeout(() => {
          window.location.reload()
        }, 2000)
        
        setFormData({
          name: '',
          passportNumber: '',
          visitDate: '',
          visitTimePeriod: '',
          visitTimeHour: '',
          visitTimeMinute: '',
          visitCount: '',
          wechatId: '',
          xiaohongshuId: '',
          followerCount: ''
        })
        
        // 메인 페이지로 돌아가서 카드 업데이트를 위해 페이지 새로고침
        setTimeout(() => {
          router.push('/')
          // 페이지 새로고침으로 카드 업데이트
          window.location.reload()
        }, 2000)
      } else {
        setSubmitMessage('신청 제출 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('신청 오류:', error)
      setSubmitMessage('신청 제출 중 오류가 발생했습니다.')
    } finally {
      setApplying(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting':
        return 'bg-green-100 text-green-800'
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recruiting':
        return t('card.recruiting')
      case 'ongoing':
        return t('card.ongoing')
      case 'completed':
        return t('card.completed')
      default:
        return t('detail.unknown')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-gray-600">{t('detail.loading')}</span>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('detail.notFound')}</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('mypage.goHome')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* {t('detail.header')} */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>{t('nav.back')}</span>
            </button>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(experience.status)}`}>
                {getStatusText(experience.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* {t('detail.mainContent')} */}
          <div className="lg:col-span-2">
            {/* {t('detail.images')} */}
            <div className="mb-8">
              {/* {t('detail.multipleImages')} */}
              {experience.images && experience.images.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{t('detail.images')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {experience.images.map((imageUrl, index) => (
                      <div key={index} className="relative overflow-hidden rounded-xl shadow-lg">
                        <div className="relative w-full aspect-square">
                          {!imageLoaded[index] && <ImageSkeleton className="w-full aspect-square" />}
                          <Image
                            src={imageUrl}
                            alt={`${experience.title} - ${t('detail.image')} ${index + 1}`}
                            fill
                            className={`object-cover ${imageLoaded[index] ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                            onLoad={() => {
                              setImageLoaded(prev => {
                                const newState = [...prev]
                                newState[index] = true
                                return newState
                              })
                            }}
                            onError={() => {
                              console.error('이미지 로드 실패:', imageUrl)
                              setImageLoaded(prev => {
                                const newState = [...prev]
                                newState[index] = false
                                return newState
                              })
                            }}
                            priority={index < 2} // 첫 2개 이미지는 우선 로딩
                            sizes="(max-width: 768px) 100vw, 50vw"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                            unoptimized={false}
                          />
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded">
                          {index + 1} / {experience.images?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-square bg-gray-200 flex items-center justify-center rounded-xl">
                  <span className="text-gray-400 text-lg">{t('detail.imageError')}</span>
                </div>
              )}
            </div>

            {/* {t('detail.titleAndInfo')} */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 hover:border-pink-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-pink-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {displayTitle}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {displayDescription}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span className="text-gray-600">
                    {currentLanguage === 'zh' ? '开始日期' : '시작일'}: {experience.startDate ? (experience.startDate instanceof Date ? experience.startDate.toISOString().split('T')[0] : experience.startDate) : '-'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-red-600" />
                  <span className="text-gray-600">
                    {currentLanguage === 'zh' ? '结束日期' : '종료일'}: {experience.endDate ? (experience.endDate instanceof Date ? experience.endDate.toISOString().split('T')[0] : experience.endDate) : '-'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span className="text-gray-600">
                    {currentLanguage === 'zh' ? '地点' : '장소'}: {displayLocation}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-red-600" />
                  <span className="text-gray-600">
                    {currentLanguage === 'zh' ? '参与者' : '참여자'}: {applicationCount}/{experience.maxParticipants}{currentLanguage === 'zh' ? '人' : '명'}
                  </span>
                </div>
              </div>
            </div>

            {/* 태그 섹션 */}
            {experience.category && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-purple-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="h-6 w-6 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {currentLanguage === 'zh' ? '标签' : '태그'}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
                    {experience.category}
                  </span>
                  {experience.activityType && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                      {experience.activityType === 'experience' ? (currentLanguage === 'zh' ? '体验团' : '체험단') : (currentLanguage === 'zh' ? '记者团' : '기자단')}
                    </span>
                  )}
                  {/* 언어별 사용자 정의 태그들 */}
                  {(() => {
                    let displayTags: string[] = []
                    
                    if (currentLanguage === 'zh') {
                      displayTags = experience.tagsZh || experience.tags || []
                    } else {
                      displayTags = experience.tags || []
                    }
                    
                    return displayTags.length > 0 ? displayTags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                        {tag}
                      </span>
                    )) : null
                  })()}
                </div>
              </div>
            )}

            {/* {t('detail.benefits')} */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100 hover:border-yellow-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-yellow-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                {currentLanguage === 'zh' ? '体验福利' : '체험 혜택'}
              </h2>
              <ul className="space-y-2">
                {displayBenefits && displayBenefits.length > 0 ? (
                  displayBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">{currentLanguage === 'zh' ? '暂无福利信息' : '혜택 정보가 없습니다'}</li>
                )}
              </ul>
            </div>

            {/* {t('detail.requirements')} */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{currentLanguage === 'zh' ? '参与条件' : '참여 조건'}</h2>
              <ul className="space-y-2">
                {displayRequirements && displayRequirements.length > 0 ? (
                  displayRequirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">{currentLanguage === 'zh' ? '暂无参与条件信息' : '참여 조건 정보가 없습니다'}</li>
                )}
              </ul>
            </div>

            {/* {t('detail.applicationForm')} */}
            <div id="application-form" className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-green-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="h-6 w-6 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {currentLanguage === 'zh' ? '体验申请' : '체험단 신청'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitMessage && (
                  <div className={`p-3 rounded-lg text-sm ${
                    submitMessage.includes(t('detail.success')) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '姓名' : '이름'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={currentLanguage === 'zh' ? '请输入您的姓名' : '이름을 입력해주세요'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '护照号码' : '여권번호'}
                  </label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={currentLanguage === 'zh' ? '请输入您的护照号码（可选）' : '여권번호를 입력해주세요 (선택사항)'}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentLanguage === 'zh' ? '访问日期' : '방문 날짜'} *
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        style={{
                          colorScheme: 'light'
                        }}
                      />
                      {!formData.visitDate && (
                        <div className="absolute inset-0 flex items-center px-3 pointer-events-none text-gray-400 text-sm">
                          {currentLanguage === 'zh' ? '年-月-日' : '년-월-일'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentLanguage === 'zh' ? '访问时间' : '방문 시간'} *
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        name="visitTimePeriod"
                        value={formData.visitTimePeriod}
                        onChange={handleInputChange}
                        required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{currentLanguage === 'zh' ? '选择时段' : '시간대 선택'}</option>
                        <option value="AM">{currentLanguage === 'zh' ? '上午' : '오전'}</option>
                        <option value="PM">{currentLanguage === 'zh' ? '下午' : '오후'}</option>
                      </select>
                      
                      <select
                        name="visitTimeHour"
                        value={formData.visitTimeHour}
                        onChange={handleInputChange}
                        required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{currentLanguage === 'zh' ? '选择小时' : '시간 선택'}</option>
                        <option value="1">{currentLanguage === 'zh' ? '1时' : '1시'}</option>
                        <option value="2">{currentLanguage === 'zh' ? '2时' : '2시'}</option>
                        <option value="3">{currentLanguage === 'zh' ? '3时' : '3시'}</option>
                        <option value="4">{currentLanguage === 'zh' ? '4时' : '4시'}</option>
                        <option value="5">{currentLanguage === 'zh' ? '5时' : '5시'}</option>
                        <option value="6">{currentLanguage === 'zh' ? '6时' : '6시'}</option>
                        <option value="7">{currentLanguage === 'zh' ? '7时' : '7시'}</option>
                        <option value="8">{currentLanguage === 'zh' ? '8时' : '8시'}</option>
                        <option value="9">{currentLanguage === 'zh' ? '9时' : '9시'}</option>
                        <option value="10">{currentLanguage === 'zh' ? '10时' : '10시'}</option>
                        <option value="11">{currentLanguage === 'zh' ? '11时' : '11시'}</option>
                        <option value="12">{currentLanguage === 'zh' ? '12时' : '12시'}</option>
                      </select>
                      
                      <select
                        name="visitTimeMinute"
                        value={formData.visitTimeMinute}
                        onChange={handleInputChange}
                        required
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{currentLanguage === 'zh' ? '选择分钟' : '분 선택'}</option>
                        <option value="00">{currentLanguage === 'zh' ? '00分' : '00분'}</option>
                        <option value="05">{currentLanguage === 'zh' ? '05分' : '05분'}</option>
                        <option value="10">{currentLanguage === 'zh' ? '10分' : '10분'}</option>
                        <option value="15">{currentLanguage === 'zh' ? '15分' : '15분'}</option>
                        <option value="20">{currentLanguage === 'zh' ? '20分' : '20분'}</option>
                        <option value="25">{currentLanguage === 'zh' ? '25分' : '25분'}</option>
                        <option value="30">{currentLanguage === 'zh' ? '30分' : '30분'}</option>
                        <option value="35">{currentLanguage === 'zh' ? '35分' : '35분'}</option>
                        <option value="40">{currentLanguage === 'zh' ? '40分' : '40분'}</option>
                        <option value="45">{currentLanguage === 'zh' ? '45分' : '45분'}</option>
                        <option value="50">{currentLanguage === 'zh' ? '50分' : '50분'}</option>
                        <option value="55">{currentLanguage === 'zh' ? '55分' : '55분'}</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '访问人数' : '방문 인원'} *
                  </label>
                  <select
                    name="visitCount"
                    value={formData.visitCount}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">{currentLanguage === 'zh' ? '选择人数' : '인원 선택'}</option>
                    <option value="1">{currentLanguage === 'zh' ? '1人' : '1명'}</option>
                    <option value="2">{currentLanguage === 'zh' ? '2人' : '2명'}</option>
                    <option value="3">{currentLanguage === 'zh' ? '3人' : '3명'}</option>
                    <option value="4">{currentLanguage === 'zh' ? '4人' : '4명'}</option>
                    <option value="5">{currentLanguage === 'zh' ? '5人以上' : '5명 이상'}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '微信ID' : '위쳇 ID'} *
                  </label>
                  <input
                    type="text"
                    name="wechatId"
                    value={formData.wechatId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={currentLanguage === 'zh' ? '请输入您的微信ID' : '위쳇 ID를 입력해주세요'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '小红书ID' : '샤오홍슈 ID'} *
                  </label>
                  <input
                    type="text"
                    name="xiaohongshuId"
                    value={formData.xiaohongshuId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={currentLanguage === 'zh' ? '请输入您的小红书ID' : '샤오홍슈 ID를 입력해주세요'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage === 'zh' ? '粉丝数量' : '팔로워 수'} *
                  </label>
                  <input
                    type="number"
                    name="followerCount"
                    value={formData.followerCount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={currentLanguage === 'zh' ? '请输入您的粉丝数量' : '팔로워 수를 입력해주세요'}
                  />
                </div>
                
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    {t('detail.privacyConsent')} *
                  </label>
                </div>
                
                <button
                  type="submit"
                  disabled={applying}
                  className={`w-full py-3 px-4 font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                    applied 
                      ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-50'
                  }`}
                >
                  {applying 
                    ? (currentLanguage === 'zh' ? '申请中...' : '신청 중...') 
                    : applied 
                      ? (currentLanguage === 'zh' ? '申请完成' : '신청 완료') 
                      : (currentLanguage === 'zh' ? '立即申请' : '지금 신청하기')
                  }
                </button>
              </form>
            </div>
          </div>

          {/* {t('detail.sidebar')} */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* {t('detail.applicationCard')} */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-sm p-6 mb-6 border border-pink-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {currentLanguage === 'zh' ? '申请信息' : '신청 정보'}
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {currentLanguage === 'zh' ? '参与者' : '참여자'}
                    </span>
                    <span className="font-medium">
                      {applicationCount}/{experience.maxParticipants}{currentLanguage === 'zh' ? '人' : '명'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {currentLanguage === 'zh' ? '剩余天数' : '남은 일수'}
                    </span>
                    <span className="font-medium text-red-600">
                      {experience.daysLeft}{currentLanguage === 'zh' ? '天' : '일'}
                    </span>
                  </div>
                </div>

                {experience.status === 'recruiting' ? (
                  <button
                    onClick={handleApply}
                    disabled={applying || applied}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      applied
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {applying 
                      ? (currentLanguage === 'zh' ? '申请中...' : '신청 중...') 
                      : applied 
                        ? (currentLanguage === 'zh' ? '申请完成' : '신청 완료') 
                        : (currentLanguage === 'zh' ? '立即申请' : '체험단 신청하기')
                    }
                  </button>
                ) : (
                  <div className={`text-center py-3 px-4 rounded-lg font-medium ${
                    experience.status === 'ongoing' 
                      ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200' 
                      : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200'
                  }`}>
                    {experience.status === 'ongoing' ? t('detail.ongoing') : t('detail.completed')}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-pink-200">
                  <p className="text-sm text-gray-500 text-center">
                    {currentLanguage === 'zh' ? '문의' : '문의'}: jalpalja0001@gmail.com
                  </p>
                </div>
              </div>

              {/* {t('detail.infoCard')} */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('detail.infoCard')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('detail.status')}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      experience.status === 'recruiting' ? 'bg-green-100 text-green-700 border border-green-200' :
                      experience.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {getStatusText(experience.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('detail.registrationDate')}</span>
                    <span className="font-medium">
                      {(() => {
                        if (!experience.createdAt) {
                          return t('detail.noDateInfo')
                        }
                        
                        return experience.createdAt ? experience.createdAt.toLocaleDateString('ko-KR') : t('detail.noDateInfo')
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
