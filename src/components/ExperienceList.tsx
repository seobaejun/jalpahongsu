'use client'

import { useState, useEffect } from 'react'
import ExperienceCard from './ExperienceCard'
import { useLanguage } from '@/contexts/LanguageContext'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Experience } from '@/types/database'

export default function ExperienceList() {
  const [filter, setFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(8)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  // Firestore에서 데이터 가져오기
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true)
        const experiencesRef = collection(db, 'experiences')
        const q = query(experiencesRef, orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        
        const experiencesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Experience[]
        
        setExperiences(experiencesData)
      } catch (error) {
        console.error('체험단 데이터 로딩 오류:', error)
        setExperiences([]) // 오류 시 빈 배열로 설정
      } finally {
        setLoading(false)
      }
    }

    fetchExperiences()
  }, [])

  // 날짜에 따른 상태 자동 계산 함수
  const getStatusByDate = (experience: Experience) => {
    if (!experience.recruitmentStartDate || !experience.recruitmentEndDate) {
      return experience.status // 기존 상태 사용
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
    
    return experience.status // 기본값
  }

  const filteredExperiences = (() => {
    switch (filter) {
      case 'recruiting':
        return experiences.filter(exp => getStatusByDate(exp) === 'recruiting')
      case 'ongoing':
        return experiences.filter(exp => getStatusByDate(exp) === 'ongoing')
      case 'completed':
        return experiences.filter(exp => getStatusByDate(exp) === 'completed')
      default:
        return experiences
    }
  })()

  const displayedExperiences = filteredExperiences.slice(0, visibleCount)
  const hasMore = filteredExperiences.length > visibleCount

  // 필터가 변경될 때 visibleCount 초기화
  useEffect(() => {
    setVisibleCount(8)
  }, [filter])

  // 로딩 상태 표시
  if (loading) {
    return (
      <section id="experiences-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-lg text-gray-600">체험단 데이터를 불러오는 중...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="experiences-section" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('experiences.title')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('experiences.subtitle')}
          </p>
        </div>

          {/* 필터 버튼 */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('experiences.filter.all')}
            </button>
            <button
              onClick={() => setFilter('recruiting')}
              className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filter === 'recruiting' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('experiences.filter.recruiting')}
            </button>
            <button
              onClick={() => setFilter('ongoing')}
              className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filter === 'ongoing' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('experiences.filter.ongoing')}
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('experiences.filter.completed')}
            </button>
          </div>

          {/* 체험단 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayedExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="text-center mt-12">
              <button 
                onClick={() => setVisibleCount(prev => prev + 8)}
                className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {t('experiences.more')}
              </button>
            </div>
          )}
      </div>
    </section>
  )
}
