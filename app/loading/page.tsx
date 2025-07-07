"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function LoadingPage() {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState("이미지 업로드 중...")
  const router = useRouter()

  useEffect(() => {
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
        // 더 천천히 진행 (실제 처리 시간 20-30분에 맞춤)
        const newProgress = prev + Math.random() * 2

        const stageIndex = Math.floor((newProgress / 100) * stages.length)
        if (stageIndex < stages.length && stageIndex !== currentStage) {
          currentStage = stageIndex
          setStage(stages[stageIndex])
        }

        // 95%에서 멈춤 (실제 처리 완료까지 대기)
        if (newProgress >= 95) {
          setStage("Gaussian Splatting 학습 중... (약 20-30분 소요)")
          return 95
        }
        return newProgress
      })
    }, 2000) // 2초마다 업데이트

    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="min-h-screen bg-[#F5E6D3] flex flex-col items-center justify-center p-4">
      <div className="loading-container">
        <div className="logo-container">
          <div className="logo-p">
            <div className="logo-inner">
              <div className="water-container">
                <div className="water"></div>
              </div>
              <div className="play-triangle"></div>
            </div>
          </div>
        </div>

        <div className="content-container">
          <div className="loading-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>

          <div className="loading-text">PROCESSING</div>
          <div className="stage-text">{stage}</div>

          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          width: 100%;
          max-width: 600px;
        }

        .logo-container {
          position: relative;
          margin-bottom: 3rem;
        }

        .logo-p {
          width: clamp(200px, 25vw, 400px);
          height: clamp(200px, 25vw, 400px);
          background-color: #1e3a5f;
          border-radius: 30px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 30px rgba(30, 58, 95, 0.3);
          animation: logoFloat 3s ease-in-out infinite;
        }

        .logo-inner {
          width: 75%;
          height: 75%;
          background-color: #f0f0f0;
          border-radius: 20px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .play-triangle {
          width: 0;
          height: 0;
          border-left: clamp(30px, 4vw, 60px) solid #2b7de9;
          border-top: clamp(20px, 2.5vw, 40px) solid transparent;
          border-bottom: clamp(20px, 2.5vw, 40px) solid transparent;
          margin-left: clamp(8px, 1vw, 15px);
          position: relative;
          z-index: 3;
        }

        .water-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 20px;
          z-index: 1;
        }

        .water {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(180deg, #4fc3f7 0%, #2196f3 50%, #1976d2 100%);
          border-radius: 0 0 20px 20px;
          animation: waterRise 4s ease-in-out infinite;
          box-shadow: 
            inset 0 10px 20px rgba(255, 255, 255, 0.3),
            inset 0 -10px 20px rgba(0, 0, 0, 0.2);
        }

        .water::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 0;
          width: 200%;
          height: 20px;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.3) 10px,
            rgba(255, 255, 255, 0.3) 20px
          );
          animation: wave 2s linear infinite;
        }

        .water::after {
          content: '';
          position: absolute;
          top: -15px;
          left: 0;
          width: 200%;
          height: 20px;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 15px,
            rgba(255, 255, 255, 0.2) 15px,
            rgba(255, 255, 255, 0.2) 30px
          );
          animation: wave 3s linear infinite reverse;
        }

        @keyframes waterRise {
          0% { height: 0%; }
          50% { height: 85%; }
          100% { height: 0%; }
        }

        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: clamp(15px, 2vw, 25px);
          margin-bottom: 2rem;
        }

        .dot {
          width: clamp(20px, 2.5vw, 35px);
          height: clamp(20px, 2.5vw, 35px);
          border-radius: 50%;
          background-color: #1e3a5f;
        }

        .dot:nth-child(1) { animation: loadingPulse 1.5s ease-in-out infinite; }
        .dot:nth-child(2) { background-color: #2d4a6b; animation: loadingPulse 1.5s ease-in-out infinite 0.1s; }
        .dot:nth-child(3) { background-color: #4a6b8a; animation: loadingPulse 1.5s ease-in-out infinite 0.2s; }
        .dot:nth-child(4) { background-color: #6b8aaa; animation: loadingPulse 1.5s ease-in-out infinite 0.3s; }
        .dot:nth-child(5) { background-color: #c0c0c0; animation: loadingPulse 1.5s ease-in-out infinite 0.4s; }

        @keyframes loadingPulse {
          0%, 60%, 100% { transform: scale(1); opacity: 0.7; }
          30% { transform: scale(1.3); opacity: 1; }
        }

        .loading-text {
          font-size: clamp(2rem, 5vw, 4rem);
          font-weight: bold;
          color: #1e3a5f;
          letter-spacing: clamp(0.3rem, 0.5vw, 0.8rem);
          margin-bottom: 1rem;
        }

        .stage-text {
          font-size: 1.2rem;
          color: #1e3a5f;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .progress-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: rgba(30, 58, 95, 0.2);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2196f3, #4fc3f7);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1e3a5f;
        }

        @media (max-width: 768px) {
          .loading-container { padding: 1rem; }
          .logo-container { margin-bottom: 2rem; }
          .loading-dots { margin-bottom: 1.5rem; gap: 12px; }
          .loading-text { letter-spacing: 0.2rem; margin-bottom: 1rem; }
          .stage-text { font-size: 1rem; margin-bottom: 1.5rem; }
        }

        .content-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 500px;
        }
      `}</style>
    </div>
  )
}
