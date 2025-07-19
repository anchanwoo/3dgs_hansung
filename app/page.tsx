"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, ImageIcon, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedImages((prev) => [...prev, ...files])
  }

  const handleFileSelect = () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStartProcessing = async () => {
    if (selectedImages.length === 0) return
    setIsUploading(true)
    try {
      // 핵심 기능: window.selectedFiles에 파일 객체 저장
      window.selectedFiles = selectedImages;
      router.push("/loading")
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex flex-col items-center justify-center p-6">
      {/* 상단 로고/검색창 부분 제거 */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : selectedImages.length > 0
                ? "border-green-500 bg-green-50"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <Upload className="mx-auto h-10 w-10 text-blue-400 mb-2" />
          <p className="text-lg font-semibold">
            {dragActive
              ? "이미지를 여기에 놓으세요"
              : selectedImages.length > 0
                ? `${selectedImages.length}개 이미지 선택됨`
                : "이미지를 드래그하거나 클릭해서 업로드"}
          </p>
          <p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP 지원</p>
          <Button variant="outline" className="mt-4" type="button">
            <ImageIcon className="h-4 w-4 mr-2" />
            파일 선택
          </Button>
        </div>
        <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />
        {selectedImages.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">선택된 이미지</h3>
            <div className="grid grid-cols-4 gap-2">
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-20 object-cover rounded-lg border" />
                  <button
                    onClick={e => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        <Button
          onClick={handleStartProcessing}
          disabled={selectedImages.length === 0 || isUploading}
          className="w-full mt-8 py-3 text-lg rounded-full shadow-md"
        >
          <Play className="h-5 w-5 mr-2" />
          {isUploading ? "처리 중..." : `3D 재구성 시작 (${selectedImages.length}개)`}
        </Button>
      </div>
    </div>
  )
}
