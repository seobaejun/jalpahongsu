'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const HomeSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      id: 'xiaohongshu',
      title: '샤오홍슈 체험단',
      description: '중국 최대 소셜 플랫폼에서 제품을 홍보하고 리뷰를 작성해보세요',
      link: '/xiaohongshu',
      color: 'from-pink-500 to-red-500',
      icon: '📱'
    },
    {
      id: 'instagram',
      title: '인스타그램 체험단',
      description: '세계적인 소셜 미디어에서 브랜드와 함께 콘텐츠를 제작해보세요',
      link: '/instagram',
      color: 'from-purple-500 to-pink-500',
      icon: '📷'
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  // 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
      {/* 배경 원형 요소들 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-pink-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-40 h-40 bg-blue-200 rounded-full opacity-30 blur-3xl"></div>
      </div>

      {/* 슬라이더 컨테이너 */}
      <div className="relative z-10 h-full flex items-center justify-center px-4">
        <div className="max-w-6xl w-full">
          {/* 슬라이더 */}
          <div className="relative">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index === (currentSlide + 1) % slides.length
                    ? 'opacity-0 translate-x-full'
                    : 'opacity-0 -translate-x-full'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8 lg:gap-16">
                  {/* 텍스트 영역 (왼쪽) */}
                  <div className="flex-1 text-center lg:text-left max-w-lg">
                    <div className="space-y-6">
                      <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                        {slide.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <Link
                          href={slide.link}
                          className={`px-8 py-4 bg-gradient-to-r ${slide.color} text-white rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300`}
                        >
                          체험단 참여하기
                        </Link>
                        <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300">
                          자세히 보기
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 이미지 영역 (오른쪽) */}
                  <div className="flex-1 flex justify-center lg:justify-end">
                    <div className="relative">
                      <div className={`w-80 h-80 lg:w-96 lg:h-96 ${slide.id === 'xiaohongshu' ? 'bg-pink-50' : 'bg-purple-50'} rounded-3xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-500 overflow-hidden`}>
                        <div className="relative w-full h-full">
                          {/* 모바일 이미지 */}
                          <img
                            src={slide.id === 'xiaohongshu' 
                              ? 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop&crop=face' 
                              : 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=600&fit=crop&crop=face'
                            }
                            alt={slide.title}
                            className="w-full h-full object-cover rounded-3xl"
                          />
                          {/* 오버레이 그라데이션 */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${slide.id === 'xiaohongshu' ? 'from-pink-500/20 to-red-500/20' : 'from-purple-500/20 to-pink-500/20'} rounded-3xl`}></div>
                          {/* 아이콘 오버레이 */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-6xl lg:text-8xl opacity-80">
                              {slide.id === 'xiaohongshu' ? (
                                <div className="text-pink-600 drop-shadow-lg">📱</div>
                              ) : (
                                <div className="text-purple-600 drop-shadow-lg">📷</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* 3D 효과를 위한 그림자 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={prevSlide}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* 슬라이드 인디케이터 */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-gray-800 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 transition-all duration-300"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 하단 바로가기 박스들 */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col sm:flex-row gap-8">
          <Link
            href="/xiaohongshu"
            className="group flex items-center space-x-6 bg-white/95 backdrop-blur-sm px-12 py-10 rounded-4xl shadow-2xl hover:shadow-3xl transform hover:scale-115 transition-all duration-300 min-w-[400px]"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-red-500 rounded-3xl flex items-center justify-center">
              <span className="text-white font-bold text-4xl">小</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-800 text-2xl">샤오홍슈 체험단</div>
              <div className="text-lg text-gray-600">바로가기</div>
            </div>
            <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/instagram"
            className="group flex items-center space-x-6 bg-white/95 backdrop-blur-sm px-12 py-10 rounded-4xl shadow-2xl hover:shadow-3xl transform hover:scale-115 transition-all duration-300 min-w-[400px]"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center">
              <span className="text-white font-bold text-4xl">IG</span>
            </div>
            <div className="text-left">
              <div className="font-bold text-gray-800 text-2xl">인스타그램 체험단</div>
              <div className="text-lg text-gray-600">바로가기</div>
            </div>
            <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomeSlider
