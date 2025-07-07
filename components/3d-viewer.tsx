"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, useGLTF, Environment, Html } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import type * as THREE from "three"

interface ModelProps {
  url: string
}

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url)
  const meshRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return <primitive ref={meshRef} object={scene} scale={2} />
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <p className="text-gray-600">3D 모델 로딩 중...</p>
      </div>
    </Html>
  )
}

interface ThreeDViewerProps {
  modelUrl: string
}

export default function ThreeDViewer({ modelUrl }: ThreeDViewerProps) {
  const [autoRotate, setAutoRotate] = useState(true)

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      {/* 컨트롤 패널 */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Button variant="secondary" size="sm" onClick={() => setAutoRotate(!autoRotate)}>
          <RotateCcw className="h-4 w-4 mr-2" />
          {autoRotate ? "회전 정지" : "자동 회전"}
        </Button>
      </div>

      {/* 3D 뷰어 */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "linear-gradient(to bottom, #f0f9ff, #e0f2fe)" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
        />
      </Canvas>

      {/* 사용법 안내 */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p className="font-medium mb-1">3D 뷰어 조작법</p>
        <p>• 마우스 드래그: 회전</p>
        <p>• 휠: 확대/축소</p>
        <p>• 우클릭 드래그: 이동</p>
      </div>
    </div>
  )
}
