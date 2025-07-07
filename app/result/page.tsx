"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Home, Eye, EyeOff } from "lucide-react"
import PLYViewer from "@/components/ply-viewer"

function ResultContent() {
  const router = useRouter()
  const [plyBlobUrl, setPlyBlobUrl] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number>(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [show3DViewer, setShow3DViewer] = useState(true)

  // sessionStorage에서 데이터 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBlobUrl = sessionStorage.getItem('plyBlobUrl')
      const storedSessionId = sessionStorage.getItem('sessionId')
      const storedFileSize = sessionStorage.getItem('fileSize')
      
      if (storedBlobUrl) {
        setPlyBlobUrl(storedBlobUrl)
        setSessionId(storedSessionId)
        setFileSize(storedFileSize ? parseInt(storedFileSize) : 0)
      } else {
        router.push('/')
      }
    }
  }, [router])

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      if (plyBlobUrl) {
        const link = document.createElement("a")
        link.href = plyBlobUrl
        link.download = `gaussian-splatting-${sessionId || Date.now()}.ply`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error("PLY 파일이 준비되지 않았습니다.")
      }
    } catch (error) {
      console.error("Download failed:", error)
      alert("다운로드에 실패했습니다.")
    } finally {
      setTimeout(() => {
        setIsDownloading(false)
      }, 1500)
    }
  }

  const handleGoHome = () => {
    // sessionStorage 정리
    if (plyBlobUrl) {
      URL.revokeObjectURL(plyBlobUrl)
    }
    sessionStorage.removeItem('plyBlobUrl')
    sessionStorage.removeItem('sessionId')
    sessionStorage.removeItem('fileSize')
    router.push("/")
  }

  if (!plyBlobUrl) {
    return (
      <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">결과 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5E6D3] relative">
      {/* 왼쪽 상단 로고 */}
      <div className="absolute top-6 left-6 z-10">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hyYpgbtHpnjhY0QvyjUbUKXh7ChY9K.png"
          alt="3D Reconstruction Logo"
          className="w-16 h-16 object-contain cursor-pointer hover:scale-105 transition-transform"
          onClick={handleGoHome}
        />
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        {/* 뷰어 모드 전환 버튼 */}
        <div className="mb-4 flex justify-center">
          <div className="bg-white rounded-full p-1 shadow-lg">
            <Button
              variant={show3DViewer ? "default" : "outline"}
              size="sm"
              onClick={() => setShow3DViewer(true)}
              className="rounded-full px-6"
            >
              <Eye className="h-4 w-4 mr-2" />
              3D 뷰어
            </Button>
            <Button
              variant={!show3DViewer ? "default" : "outline"}
              size="sm"
              onClick={() => setShow3DViewer(false)}
              className="rounded-full px-6 ml-2"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              정보
            </Button>
          </div>
        </div>

        {/* 3D 뷰어 또는 결과 정보 */}
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden mb-8 relative">
          {show3DViewer ? (
            /* 3D PLY 뷰어 */
            <div className="p-4">
              <PLYViewer plyBlobUrl={plyBlobUrl || ""} />
            </div>
          ) : (
            /* 결과 정보 */
            <div className="aspect-video relative bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">3D 재구성 완료!</h2>
                <p className="text-gray-600 mb-4">Gaussian Splatting 기술로 생성된 고품질 3D 모델입니다.</p>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 inline-block">
                  <p className="text-sm text-gray-600">
                    파일 크기: {fileSize ? Math.round(fileSize / 1024) + ' KB' : '계산 중...'}
                  </p>
                  <p className="text-sm text-gray-600">
                    세션 ID: {sessionId}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="px-8 py-3 text-lg bg-white hover:bg-gray-50 border-2 border-gray-300"
          >
            <Home className="h-5 w-5 mr-2" />
            홈으로
          </Button>

          <Button
            onClick={handleDownload}
            disabled={isDownloading || !plyBlobUrl}
            className="px-12 py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            <Download className="h-5 w-5 mr-2" />
            {isDownloading ? "다운로드 중..." : "PLY 파일 다운로드"}
          </Button>
        </div>

        {/* 뷰어 상태별 안내 */}
        <div className="text-center text-gray-600 max-w-2xl">
          {show3DViewer ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🎮 3D 점군 뷰어</h3>
              <p className="text-sm mb-2">마우스로 회전, 확대/축소, 이동이 가능합니다</p>
              <p className="text-xs text-gray-500">
                자동 회전이 활성화되어 있습니다 • 점군 크기와 색상이 자동으로 최적화됨
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">📁 파일 정보</h3>
              <p className="text-sm mb-2">지원 형식: PLY • Blender나 다른 3D 소프트웨어에서 열어볼 수 있습니다</p>
              <p className="text-xs text-gray-500">
                온라인 PLY 뷰어: viewstl.com, 3dviewer.net 등에서도 확인 가능
              </p>
            </div>
          )}
        </div>

        {/* 처리 통계 */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-xl font-bold text-blue-600">완료</p>
            <p className="text-sm text-gray-600">처리 상태</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-xl font-bold text-green-600">PLY</p>
            <p className="text-sm text-gray-600">파일 형식</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <p className="text-xl font-bold text-purple-600">
              {fileSize ? Math.round(fileSize / 1024) : "?"} KB
            </p>
            <p className="text-sm text-gray-600">파일 크기</p>
          </div>
        </div>

        {/* 다음 단계 안내 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl">
          <h3 className="font-medium text-blue-800 mb-2">📁 PLY 파일 활용 방법</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Blender</strong>: File → Import → Stanford (.ply)</li>
            <li>• <strong>MeshLab</strong>: 무료 3D 메시 처리 소프트웨어</li>
            <li>• <strong>온라인 뷰어</strong>: viewstl.com, 3dviewer.net</li>
            <li>• <strong>CloudCompare</strong>: 점군 데이터 전문 도구</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return <ResultContent />
}
