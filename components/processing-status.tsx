"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"

type ProcessingStage = "idle" | "uploading" | "processing" | "gaussian" | "rendering" | "completed" | "error"

interface ProcessingStatusProps {
  stage: ProcessingStage
  progress: number
}

const stageInfo = {
  idle: { label: "대기 중", icon: Clock, color: "secondary" },
  uploading: { label: "n8n 업로드 중", icon: Loader2, color: "default" },
  processing: { label: "로컬 API 처리 중", icon: Loader2, color: "default" },
  gaussian: { label: "가우시안 연산 진행", icon: Loader2, color: "default" },
  rendering: { label: "3D 렌더링 중", icon: Loader2, color: "default" },
  completed: { label: "완료", icon: CheckCircle, color: "default" },
  error: { label: "오류 발생", icon: AlertCircle, color: "destructive" },
} as const

export default function ProcessingStatus({ stage, progress }: ProcessingStatusProps) {
  const currentStage = stageInfo[stage]
  const Icon = currentStage.icon

  const stages = [
    { key: "uploading", label: "n8n 업로드", description: "이미지를 n8n 워크플로우로 전송" },
    { key: "processing", label: "로컬 API 처리", description: "로컬 서버에서 이미지 전처리" },
    { key: "gaussian", label: "가우시안 연산", description: "3D 포인트 클라우드 생성" },
    { key: "rendering", label: "3D 렌더링", description: "최종 3D 모델 생성" },
  ]

  const getStageStatus = (stageKey: string) => {
    const stageOrder = ["uploading", "processing", "gaussian", "rendering", "completed"]
    const currentIndex = stageOrder.indexOf(stage)
    const stageIndex = stageOrder.indexOf(stageKey)

    if (stage === "error") return "error"
    if (stageIndex < currentIndex) return "completed"
    if (stageIndex === currentIndex) return "active"
    return "pending"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon
            className={`h-5 w-5 ${stage === "uploading" || stage === "processing" || stage === "gaussian" || stage === "rendering" ? "animate-spin" : ""}`}
          />
          처리 상태
        </CardTitle>
        <CardDescription>3D 재구성 파이프라인의 현재 진행 상황입니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 전체 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">전체 진행률</span>
            <Badge variant={currentStage.color as any}>{currentStage.label}</Badge>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500">{progress}% 완료</p>
        </div>

        {/* 단계별 상태 */}
        <div className="space-y-4">
          <h4 className="font-medium">처리 단계</h4>
          <div className="space-y-3">
            {stages.map((stageItem, index) => {
              const status = getStageStatus(stageItem.key)
              return (
                <div key={stageItem.key} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      status === "completed"
                        ? "bg-green-100 text-green-700"
                        : status === "active"
                          ? "bg-blue-100 text-blue-700"
                          : status === "error"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {status === "completed" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : status === "active" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status === "error" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        status === "active"
                          ? "text-blue-700"
                          : status === "completed"
                            ? "text-green-700"
                            : status === "error"
                              ? "text-red-700"
                              : "text-gray-500"
                      }`}
                    >
                      {stageItem.label}
                    </p>
                    <p className="text-sm text-gray-500">{stageItem.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {stage === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">처리 중 오류가 발생했습니다.</p>
            <p className="text-red-600 text-sm mt-1">이미지 품질을 확인하거나 다시 시도해주세요.</p>
          </div>
        )}

        {stage === "completed" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-700 font-medium">3D 재구성이 완료되었습니다!</p>
            <p className="text-green-600 text-sm mt-1">결과 탭에서 3D 모델을 확인할 수 있습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
