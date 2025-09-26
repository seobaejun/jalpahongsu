'use client'

interface ImageSkeletonProps {
  className?: string
}

export default function ImageSkeleton({ className = "w-full aspect-square" }: ImageSkeletonProps) {
  return (
    <div className={`${className} bg-gray-200 animate-pulse rounded-lg`}>
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  )
}
