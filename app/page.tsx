"use client"

import type React from "react"

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
      // 로딩 페이지로 먼저 이동
      router.push("/loading")

      // 실제 API 호출
      const formData = new FormData()
      selectedImages.forEach((file) => {
        formData.append("images", file)
      })

      // 환경변수에서 백엔드 API 주소를 읽어옴
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://3dgs.ngrok.app"
      const response = await fetch(`${apiBaseUrl}/process_images`, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        // 성공시 결과 페이지로 이동 (큰 파일은 Blob URL로 처리)
        try {
          console.log("Base64 데이터 길이:", result.plyData.length)
          console.log("Base64 데이터 첫 100자:", result.plyData.substring(0, 100))
          
          // Base64 문자열 정리 (공백, 줄바꿈 등 제거)
          const cleanBase64 = result.plyData.replace(/[\s\n\r\t]/g, '')
          
          // Base64 패딩 확인 및 수정
          let paddedBase64 = cleanBase64
          const remainder = paddedBase64.length % 4
          if (remainder !== 0) {
            paddedBase64 += '='.repeat(4 - remainder)
          }
          
          console.log("정리된 Base64 길이:", paddedBase64.length)
          
          // 안전한 Base64 디코딩
          let binaryString: string
          try {
            binaryString = atob(paddedBase64)
          } catch (decodeError) {
            console.error("Base64 디코딩 실패:", decodeError)
            console.log("문제가 있는 Base64 문자열 샘플:", paddedBase64.substring(0, 200))
            throw new Error("Base64 디코딩 실패: 올바르지 않은 Base64 문자열")
          }
          
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          
          console.log("디코딩된 바이트 크기:", bytes.length)
          
          const blob = new Blob([bytes], { type: 'application/octet-stream' })
          const blobUrl = URL.createObjectURL(blob)
          
          // sessionStorage에는 작은 데이터만 저장
          sessionStorage.setItem('plyBlobUrl', blobUrl)
          sessionStorage.setItem('sessionId', result.sessionId)
          sessionStorage.setItem('fileSize', result.fileSize.toString())
          
          router.push('/result')
        } catch (storageError) {
          console.error("파일 처리 오류:", storageError)
          alert(`파일 처리 중 오류가 발생했습니다: ${storageError instanceof Error ? storageError.message : "알 수 없는 오류"}`)
        }
      } else {
        throw new Error(result.error || "Processing failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert(`처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] flex flex-col items-center justify-center p-6">
      {/* 로고 */}
      <div className="mb-12">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hyYpgbtHpnjhY0QvyjUbUKXh7ChY9K.png"
          alt="3D Reconstruction Logo"
          className="w-64 h-64 object-contain"
        />
      </div>

      {/* 메인 업로드 카드 */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 mb-8">
        {/* 드래그 앤 드롭 영역 */}
        <div
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
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
          <div className="flex flex-col items-center space-y-3 cursor-pointer">
            <div
              className={`p-3 rounded-full ${
                dragActive ? "bg-blue-100" : selectedImages.length > 0 ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <Upload
                className={`h-8 w-8 ${
                  dragActive ? "text-blue-600" : selectedImages.length > 0 ? "text-green-600" : "text-gray-400"
                }`}
              />
            </div>

            <div className="space-y-1">
              <p className="text-lg font-medium text-gray-900">
                {dragActive
                  ? "이미지를 여기에 놓으세요"
                  : selectedImages.length > 0
                    ? `${selectedImages.length}개의 이미지가 선택됨`
                    : "이미지를 드래그하여 업로드"}
              </p>
              <p className="text-gray-500">또는 클릭하여 파일 선택</p>
            </div>

            <Button variant="outline" className="cursor-pointer px-6 py-2" type="button">
              <ImageIcon className="h-4 w-4 mr-2" />
              파일 선택
            </Button>

            <p className="text-sm text-gray-400">JPG, PNG, WebP 형식 지원</p>
          </div>
        </div>

        <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileInput} />

        {/* 선택된 이미지 미리보기 */}
        {selectedImages.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">선택된 이미지</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-h-48 overflow-y-auto">
              {selectedImages.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-300 transition-colors">
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

              {/* 3D 재구성 시작 버튼 */}
      <Button
        onClick={handleStartProcessing}
        disabled={selectedImages.length === 0 || isUploading}
        className={`px-12 py-4 text-lg rounded-full shadow-lg transition-all duration-200 ${
          selectedImages.length > 0 && !isUploading
            ? "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Play className="h-5 w-5 mr-2" />
        {isUploading ? "처리 중..." : `3D 재구성 시작 (${selectedImages.length}개 이미지)`}
      </Button>

      {/* 처리 시간 안내 */}
      {selectedImages.length > 0 && (
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-full">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">처리 시간 안내</p>
              <p className="text-sm text-yellow-700">
                3D 재구성 처리에는 <strong>20-30분</strong>이 소요됩니다. 
                처리 중에는 브라우저 탭을 닫지 마시고 기다려주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 안내 텍스트 */}
      <div className="mt-8 text-center text-gray-600 max-w-2xl">
        <p className="text-sm">3D 재구성을 위해 동일한 공간을 다양한 각도에서 촬영한 이미지를 업로드하세요</p>
      </div>
    </div>
  )
}
