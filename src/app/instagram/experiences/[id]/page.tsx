'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { submitInstagramApplication, getInstagramApplicationsByExperience } from '@/lib/applicationService'
import { Experience } from '@/types/database'
import { ArrowLeft, Calendar, Users, MapPin, Clock, Star, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import ImageSkeleton from '@/components/ImageSkeleton'

export default function InstagramExperienceDetailPage() {
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
    instagramId: '',
    followerCount: ''
  })
  const [submitMessage, setSubmitMessage] = useState('')

  // 언어별 데이터 계산
  const displayTitle = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.titleZh) {
      console.log('중국어 제목 사용:', experience.titleZh);
      return experience.titleZh;
    }
    if (currentLanguage === 'en' && experience?.titleEn) {
      console.log('영어 제목 사용:', experience.titleEn);
      return experience.titleEn;
    }
    console.log('한국어 제목 사용:', experience?.title);
    return experience?.title || '';
  }, [currentLanguage, experience?.title, experience?.titleZh, experience?.titleEn]);

  const displayDescription = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.descriptionZh) {
      return experience.descriptionZh;
    }
    if (currentLanguage === 'en' && experience?.descriptionEn) {
      return experience.descriptionEn;
    }
    return experience?.description || '';
  }, [currentLanguage, experience?.description, experience?.descriptionZh, experience?.descriptionEn]);

  const displayBenefits = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.benefitsZh) {
      return Array.isArray(experience.benefitsZh) ? experience.benefitsZh.join('\n') : experience.benefitsZh;
    }
    if (currentLanguage === 'en' && experience?.benefitsEn) {
      return Array.isArray(experience.benefitsEn) ? experience.benefitsEn.join('\n') : experience.benefitsEn;
    }
    return Array.isArray(experience?.benefits) ? experience.benefits.join('\n') : experience?.benefits || '';
  }, [currentLanguage, experience?.benefits, experience?.benefitsZh, experience?.benefitsEn]);

  const displayRequirements = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.requirementsZh) {
      return Array.isArray(experience.requirementsZh) ? experience.requirementsZh.join('\n') : experience.requirementsZh;
    }
    if (currentLanguage === 'en' && experience?.requirementsEn) {
      return Array.isArray(experience.requirementsEn) ? experience.requirementsEn.join('\n') : experience.requirementsEn;
    }
    return Array.isArray(experience?.requirements) ? experience.requirements.join('\n') : experience?.requirements || '';
  }, [currentLanguage, experience?.requirements, experience?.requirementsZh, experience?.requirementsEn]);

  const displayLocation = useMemo(() => {
    if (currentLanguage === 'zh' && experience?.locationZh) {
      return experience.locationZh;
    }
    if (currentLanguage === 'en' && experience?.locationEn) {
      return experience.locationEn;
    }
    return experience?.location || '';
  }, [currentLanguage, experience?.location, experience?.locationZh, experience?.locationEn]);

  // 날짜 변환 함수
  const convertToDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (typeof dateValue === 'string') {
      // YYYY-MM-DD 형식인지 확인
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        return new Date(dateValue);
      }
      // 다른 형식의 날짜 문자열
      return new Date(dateValue);
    }
    
    if (typeof dateValue === 'object' && dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    }
    
    return new Date();
  };

  // 등록일 계산
  const registrationDate = useMemo(() => {
    if (!experience?.createdAt) return null;
    const date = convertToDate(experience.createdAt);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [experience?.createdAt]);

  // 남은 기간 계산
  const remainingDays = useMemo(() => {
    if (!experience?.date) return null;
    const today = new Date();
    const experienceDate = convertToDate(experience.date);
    const diffTime = experienceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [experience?.date]);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        console.log('인스타그램 체험단 상세 정보 로딩 시작:', params.id)
        setLoading(true)
        
        const experienceRef = doc(db, 'instagram_experiences', params.id as string)
        const experienceSnap = await getDoc(experienceRef)
        
        if (experienceSnap.exists()) {
          const experienceData = experienceSnap.data() as Experience
          console.log('인스타그램 체험단 데이터:', experienceData)
          
          // 데이터 정리 및 변환
          const processedExperience = {
            ...experienceData,
            id: experienceSnap.id,
            title: experienceData.title || '',
            titleZh: experienceData.titleZh || '',
            titleEn: experienceData.titleEn || '',
            description: experienceData.description || '',
            descriptionZh: experienceData.descriptionZh || '',
            descriptionEn: experienceData.descriptionEn || '',
            benefits: Array.isArray(experienceData.benefits) ? experienceData.benefits : (experienceData.benefits ? [experienceData.benefits] : []),
            benefitsZh: Array.isArray(experienceData.benefitsZh) ? experienceData.benefitsZh : (experienceData.benefitsZh ? [experienceData.benefitsZh] : []),
            benefitsEn: Array.isArray(experienceData.benefitsEn) ? experienceData.benefitsEn : (experienceData.benefitsEn ? [experienceData.benefitsEn] : []),
            requirements: Array.isArray(experienceData.requirements) ? experienceData.requirements : (experienceData.requirements ? [experienceData.requirements] : []),
            requirementsZh: Array.isArray(experienceData.requirementsZh) ? experienceData.requirementsZh : (experienceData.requirementsZh ? [experienceData.requirementsZh] : []),
            requirementsEn: Array.isArray(experienceData.requirementsEn) ? experienceData.requirementsEn : (experienceData.requirementsEn ? [experienceData.requirementsEn] : []),
            location: experienceData.location || '',
            locationZh: experienceData.locationZh || '',
            locationEn: experienceData.locationEn || '',
            date: experienceData.date || '',
            time: experienceData.time || '',
            participants: experienceData.participants || 0,
            status: experienceData.status || 'recruiting',
            activityType: experienceData.activityType || 'experience',
            isNew: experienceData.isNew || false,
            image: experienceData.image || '',
            images: experienceData.images || [],
            createdAt: experienceData.createdAt
          }
          setExperience(processedExperience)
          
          // 이미지 로딩 상태 초기화
          setImageLoaded(new Array(processedExperience.images?.length || 0).fill(false))
          
          // 신청자 수 가져오기
          const applicationsResult = await getInstagramApplicationsByExperience(params.id as string)
          if (applicationsResult.success) {
            setApplicationCount(applicationsResult.applications.length)
          }
        } else {
          console.log('인스타그램 체험단을 찾을 수 없습니다')
          router.push('/instagram')
        }
      } catch (error) {
        console.error('인스타그램 체험단 로딩 오류:', error)
        router.push('/instagram')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchExperience()
    }
  }, [params.id, router, currentLanguage])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    
    console.log('인스타그램 신청서 제출 시작')
    console.log('인증 상태:', isAuthenticated)
    console.log('사용자 정보:', user)
    
    if (!isAuthenticated) {
      console.log('인증되지 않음 - 로그인 페이지로 이동')
      router.push('/login')
      return
    }

    setApplying(true)
    setSubmitMessage('')

    try {
      const applicationData = {
        experienceId: params.id as string,
        experienceTitle: displayTitle,
        name: formData.name,
        passportNumber: formData.passportNumber,
        visitDate: formData.visitDate,
        visitTime: `${formData.visitTimeHour}:${formData.visitTimeMinute}`,
        visitTimePeriod: formData.visitTimePeriod,
        visitTimeHour: formData.visitTimeHour,
        visitTimeMinute: formData.visitTimeMinute,
        visitCount: formData.visitCount,
        wechatId: formData.wechatId,
        xiaohongshuId: formData.instagramId, // instagramId를 xiaohongshuId로 매핑
        followerCount: formData.followerCount,
        userId: user?.uid || '', // 사용자 ID 추가
        status: 'pending' as const
      }

      console.log('제출할 신청서 데이터:', applicationData)

      const result = await submitInstagramApplication(applicationData)
      
      console.log('신청서 제출 결과:', result)
      
      if (result.success) {
        setApplied(true)
        setSubmitMessage(t('detail.success'))
        setApplicationCount(prev => prev + 1)
        console.log('신청서 제출 성공')
      } else {
        console.error('신청서 제출 실패:', result.error)
        setSubmitMessage(result.error || '신청에 실패했습니다.')
      }
    } catch (error) {
      console.error('신청 오류:', error)
      setSubmitMessage('신청 중 오류가 발생했습니다.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('detail.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-lg">{t('detail.notFound')}</p>
            <button 
              onClick={() => router.push('/instagram')}
              className="mt-4 text-red-600 hover:text-red-700"
            >
              {t('nav.back')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/instagram')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t('nav.back')}
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {t('detail.registrationDate')}: {registrationDate || t('detail.noDateInfo')}
              </span>
              {remainingDays !== null && (
                <span className="text-sm text-red-600 font-medium">
                  {remainingDays > 0 ? `${remainingDays}${t('detail.day')} ${t('detail.remainingDays')}` : t('detail.completed')}
                </span>
              )}
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
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-blue-100">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{displayTitle}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">{displayDescription}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2 text-red-500" />
                  <span>{t('detail.location')}: {displayLocation || t('detail.unknown')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2 text-red-500" />
                  <span>{t('detail.date')}: {experience.date || t('detail.unknown')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2 text-red-500" />
                  <span>{t('detail.time')}: {experience.time || t('detail.unknown')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2 text-red-500" />
                  <span>{t('detail.participants')}: {applicationCount} / {experience.participants} {t('detail.people')}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  experience.status === 'recruiting' ? 'bg-green-100 text-green-800' :
                  experience.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {t(`card.${experience.status}`)}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {experience.activityType === 'reporter' ? t('card.reporter') : t('card.experience')}
                </span>
                {experience.isNew && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {t('card.new')}
                  </span>
                )}
              </div>
            </div>

            {/* 태그 섹션 */}
            {experience.category && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-purple-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
{t('detail.tags')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
                    {experience.category}
                  </span>
                  {experience.activityType && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
                      {experience.activityType === 'experience' ? '체험단' : '기자단'}
                    </span>
                  )}
                  {/* 언어별 태그들 */}
                  {currentLanguage === 'zh' && experience.tags && experience.tags.length > 0 && experience.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                      {tag}
                    </span>
                  ))}
                  {currentLanguage === 'en' && experience.tagsEn && experience.tagsEn.length > 0 && experience.tagsEn.map((tag, index) => (
                    <span key={`en-${index}`} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
                      {tag}
                    </span>
                  ))}
                  {currentLanguage === 'ko' && experience.tags && experience.tags.length > 0 && experience.tags.map((tag, index) => (
                    <span key={`ko-${index}`} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* {t('detail.benefits')} */}
            {displayBenefits && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 hover:border-yellow-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-yellow-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  {t('detail.benefits')}
                </h3>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: displayBenefits.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}

            {/* {t('detail.requirements')} */}
            {displayRequirements && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-green-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  {t('detail.requirements')}
                </h3>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: displayRequirements.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}

            {/* {t('detail.applicationForm')} */}
            <div id="application-form" className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-red-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg className="h-6 w-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
{t('detail.experienceApplication')}
              </h2>
              
              {isAuthenticated ? (
                applied ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">{t('detail.applied')}</p>
                    <p className="text-gray-600">{t('detail.success')}</p>
                  </div>
                ) : (
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
                        {t('detail.name')} *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={t('detail.name')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('detail.passportNumber')} *
                      </label>
                      <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={t('detail.passportNumber')}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('detail.visitDate')} *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            name="visitDate"
                            value={formData.visitDate}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                          {t('detail.visitTime')} *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <select
                            name="visitTimePeriod"
                            value={formData.visitTimePeriod}
                            onChange={handleInputChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">{t('detail.selectPeriod')}</option>
                            <option value="AM">{t('detail.am')}</option>
                            <option value="PM">{t('detail.pm')}</option>
                          </select>
                          
                          <select
                            name="visitTimeHour"
                            value={formData.visitTimeHour}
                            onChange={handleInputChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">{t('detail.selectHour')}</option>
                            <option value="1">1{t('detail.hour')}</option>
                            <option value="2">2{t('detail.hour')}</option>
                            <option value="3">3{t('detail.hour')}</option>
                            <option value="4">4{t('detail.hour')}</option>
                            <option value="5">5{t('detail.hour')}</option>
                            <option value="6">6{t('detail.hour')}</option>
                            <option value="7">7{t('detail.hour')}</option>
                            <option value="8">8{t('detail.hour')}</option>
                            <option value="9">9{t('detail.hour')}</option>
                            <option value="10">10{t('detail.hour')}</option>
                            <option value="11">11{t('detail.hour')}</option>
                            <option value="12">12{t('detail.hour')}</option>
                          </select>
                          
                          <select
                            name="visitTimeMinute"
                            value={formData.visitTimeMinute}
                            onChange={handleInputChange}
                            required
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          >
                            <option value="">{t('detail.selectMinute')}</option>
                            <option value="00">00{t('detail.minute')}</option>
                            <option value="05">05{t('detail.minute')}</option>
                            <option value="10">10{t('detail.minute')}</option>
                            <option value="15">15{t('detail.minute')}</option>
                            <option value="20">20{t('detail.minute')}</option>
                            <option value="25">25{t('detail.minute')}</option>
                            <option value="30">30{t('detail.minute')}</option>
                            <option value="35">35{t('detail.minute')}</option>
                            <option value="40">40{t('detail.minute')}</option>
                            <option value="45">45{t('detail.minute')}</option>
                            <option value="50">50{t('detail.minute')}</option>
                            <option value="55">55{t('detail.minute')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('detail.visitCount')} *
                      </label>
                      <select
                        name="visitCount"
                        value={formData.visitCount}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">{t('detail.selectCount')}</option>
                        <option value="1">1{t('detail.people')}</option>
                        <option value="2">2{t('detail.people')}</option>
                        <option value="3">3{t('detail.people')}</option>
                        <option value="4">4{t('detail.people')}</option>
                        <option value="5">5{t('detail.people')}{t('detail.orMore')}</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('detail.wechatId')}
                      </label>
                      <input
                        type="text"
                        name="wechatId"
                        value={formData.wechatId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={t('detail.pleaseEnterWechat')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('detail.instagramId')} *
                      </label>
                      <input
                        type="text"
                        name="instagramId"
                        value={formData.instagramId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={t('detail.pleaseEnterInstagram')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('detail.followerCount')} *
                      </label>
                      <input
                        type="number"
                        name="followerCount"
                        value={formData.followerCount}
                        onChange={handleInputChange}
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder={t('detail.pleaseEnterFollowers')}
                      />
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
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
                          ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 disabled:opacity-50'
                      }`}
                    >
                      {applying ? t('detail.applying') : applied ? t('detail.applicationComplete') : t('detail.applyNow')}
                    </button>
                  </form>
                )
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">{t('detail.loginRequired')}</p>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {t('nav.login')}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* {t('detail.sidebar')} */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* {t('detail.applicationCard')} */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl shadow-sm p-6 mb-6 border border-pink-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{t('detail.applicationInfo')}</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('detail.participants')}</span>
                    <span className="font-medium">{applicationCount}/{experience.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('detail.daysLeft')}</span>
                    <span className="font-medium text-red-600">{experience.daysLeft} {t('detail.day')}</span>
                  </div>
                </div>

                {experience.status === 'recruiting' ? (
                  <button
                    onClick={handleApply}
                    disabled={applying || applied}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      applied
                        ? 'bg-red-100 text-red-800 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {applying ? t('detail.applying') : applied ? t('detail.applied') : t('detail.applyButton')}
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
                      {experience.status === 'recruiting' ? t('detail.recruiting') :
                       experience.status === 'ongoing' ? t('detail.ongoing') :
                       t('detail.completed')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('detail.registrationDate')}</span>
                    <span className="font-medium">
                      {(() => {
                        if (!experience.createdAt) {
                          return t('detail.noDateInfo')
                        }
                        
                        return experience.createdAt ? experience.createdAt.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric'
                        }) : t('detail.noDateInfo').replace(/\./g, '. ')
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
