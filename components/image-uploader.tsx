"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, X, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void
}

export default function ImageUploader({ onImagesChange }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))

      if (files.length > 0) {
        const newImages = [...selectedImages, ...files]
        setSelectedImages(newImages)
        onImagesChange(newImages)
      }
    },
    [selectedImages, onImagesChange],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = [...selectedImages, ...files]
    setSelectedImages(newImages)
    onImagesChange(newImages)
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    onImagesChange(newImages)
  }

  const clearAll = () => {
    setSelectedImages([])
    onImagesChange([])
  }

  const handleFileSelect = () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          dragActive ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-4 rounded-full ${dragActive ? "bg-blue-100" : "bg-gray-100"}`}>
            <Upload className={`h-8 w-8 ${dragActive ? "text-blue-600" : "text-gray-400"}`} />
          </div>

          <div className="space-y-2">
            <p className="text-xl font-medium text-gray-900">
              {dragActive ? "이미지를 여기에 놓으세요" : "이미지를 드래그하여 업로드"}
            </p>
            <p className="text-gray-500">또는</p>
          </div>

          <Button variant="outline" className="cursor-pointer px-8 py-2" onClick={handleFileSelect} type="button">
            <ImageIcon className="h-4 w-4 mr-2" />
            파일 선택
          </Button>
          <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />

          <p className="text-sm text-gray-400">JPG, PNG, WebP 형식 지원</p>
        </div>
      </div>

      {/* 선택된 이미지 그리드 */}
      {selectedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">선택된 이미지 ({selectedImages.length}개)</h3>
            <Button variant="outline" size="sm" onClick={clearAll}>
              전체 삭제
            </Button>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-300 transition-colors">
                  <img
                    src={URL.createObjectURL(file) || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 삭제 버튼 */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-3 w-3" />
                </Button>

                {/* 이미지 번호 */}
                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* 추가 정보 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-1 rounded">
                <ImageIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">촬영 팁</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 동일한 공간을 다양한 각도에서 촬영하세요</li>
                  <li>• 이미지 간 50-70% 정도 겹치도록 촬영하세요</li>
                  <li>• 조명이 일정한 환경에서 촬영하세요</li>
                  <li>• 흔들림 없이 선명하게 촬영하세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
