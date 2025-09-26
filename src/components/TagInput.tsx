'use client'

import { useState, KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  maxTags?: number
}

export default function TagInput({ 
  tags, 
  onTagsChange, 
  placeholder, 
  maxTags = 10 
}: TagInputProps) {
  const { t, currentLanguage } = useLanguage()
  const [inputValue, setInputValue] = useState('')

  // 다국어 텍스트
  const getPlaceholder = () => {
    if (placeholder) return placeholder
    return currentLanguage === 'zh' ? '请输入标签... (按Enter或逗号添加)' : '태그를 입력하세요... (Enter 또는 쉼표로 추가)'
  }

  const getAddButtonText = () => {
    return currentLanguage === 'zh' ? '添加' : '추가'
  }

  const getTagCountText = () => {
    return currentLanguage === 'zh' ? `标签` : `태그`
  }

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag])
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  const handleAddClick = () => {
    addTag(inputValue)
  }

  return (
    <div className="w-full">
      {/* 태그 입력 영역 */}
      <div className="flex items-center space-x-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={getPlaceholder()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={tags.length >= maxTags}
        />
        <button
          onClick={handleAddClick}
          disabled={!inputValue.trim() || tags.includes(inputValue.trim()) || tags.length >= maxTags}
          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>{getAddButtonText()}</span>
        </button>
      </div>

      {/* 태그 표시 영역 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 태그 개수 표시 */}
      <div className="text-xs text-gray-500 mt-2">
        {tags.length}/{maxTags} {getTagCountText()}
      </div>
    </div>
  )
}
