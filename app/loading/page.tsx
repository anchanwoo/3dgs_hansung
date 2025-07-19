"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

async function uploadAndDownloadPLY(files) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const formData = new FormData();
  Array.from(files).forEach(f => formData.append('images', f));
  const uploadRes = await fetch(`${API_BASE}/process_images`, {
    method: 'POST',
    body: formData,
    mode: 'cors',
    headers: { 'Accept': 'application/json' },
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => null);
    throw new Error(err?.error || `Upload failed: ${uploadRes.status}`);
  }
  const { download_url } = await uploadRes.json();
  const plyRes = await fetch(download_url, { mode: 'cors' });
  if (!plyRes.ok) throw new Error(`Download failed: ${plyRes.status}`);
  const blob = await plyRes.blob();
  return blob;
}

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("이미지 업로드 중...")
  const router = useRouter()

  useEffect(() => {
    // 진행률 애니메이션
    const stages = [
      "이미지 업로드 중...",
      "COLMAP 특징점 추출 중...",
      "COLMAP 매칭 중...",
      "3D 포인트 클라우드 생성 중...",
      "Gaussian Splatting 학습 중...",
      "3D 모델 최적화 중...",
      "결과 파일 생성 중...",
    ]
    let currentStage = 0
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 2
        const stageIndex = Math.floor((newProgress / 100) * stages.length)
        if (stageIndex < stages.length && stageIndex !== currentStage) {
          currentStage = stageIndex
          setStage(stages[stageIndex])
        }
        if (newProgress >= 95) {
          setStage("Gaussian Splatting 학습 중... (약 20-30분 소요)")
          return 95
        }
        return newProgress
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // 실제 업로드/다운로드 처리
    async function process() {
      try {
        // 랜딩 페이지에서 sessionStorage에 저장한 파일 이름 목록을 불러옴
        // 실제 파일은 window.selectedFiles 등으로 전달 필요(여기선 예시)
        // 실제로는 selectedImages를 props/context로 넘기거나, 파일 업로드를 이 페이지에서 직접 처리하는 것이 더 안전
        // 여기서는 예시로 window.selectedFiles를 사용한다고 가정
        const files = window.selectedFiles || []
        if (!files || files.length === 0) throw new Error("업로드할 이미지가 없습니다.")
        const plyBlob = await uploadAndDownloadPLY(files)
        const url = URL.createObjectURL(plyBlob)
        sessionStorage.setItem('plyBlobUrl', url)
        router.push('/result')
      } catch (e) {
        alert(e.message)
        router.push('/')
      }
    }
    process()
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-yellow-100">
      <div className="flex flex-col items-center justify-center mb-12">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 animate-spin rounded-full border-8 border-blue-400 border-t-transparent"></div>
          <div className="absolute inset-4 animate-pulse rounded-full border-4 border-yellow-300 border-t-transparent"></div>
          <div className="absolute inset-8 bg-blue-200 rounded-full opacity-60"></div>
        </div>
        <div className="text-3xl font-bold text-blue-900 mb-4">3D 모델 생성 중...</div>
        <div className="text-lg text-gray-700 mb-8">잠시만 기다려 주세요.</div>
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="loading-text text-2xl font-semibold mb-4">PROCESSING</div>
          <div className="stage-text text-lg text-blue-700 mb-4">{stage}</div>
          <div className="progress-container w-full mb-2">
            <div className="progress-bar w-full h-6 bg-blue-100 rounded-full overflow-hidden">
              <div className="progress-fill h-6 bg-gradient-to-r from-blue-400 to-yellow-300 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text text-right text-blue-900 font-bold mt-1">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
