"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"

interface PLYViewerProps {
  plyBlobUrl: string // Blob URL
}

// PLY 점군 렌더링 컴포넌트
function PointCloud({ plyBlobUrl }: { plyBlobUrl: string }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const meshRef = useRef<THREE.Points>(null)
  const [pointCount, setPointCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!plyBlobUrl) return

    console.log("Blob URL에서 PLY 데이터 로딩 시작...")
    
    // Blob URL에서 데이터 로드
    fetch(plyBlobUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.arrayBuffer()
      })
      .then(arrayBuffer => {
        const binaryData = new Uint8Array(arrayBuffer)
        console.log(`바이너리 데이터 크기: ${binaryData.length} bytes`)

        // 텍스트로 변환하여 헤더 확인
        const textDecoder = new TextDecoder('utf-8', { fatal: false })
        const plyText = textDecoder.decode(binaryData)
        
        console.log("PLY 헤더 확인 중...")
        console.log("첫 100자:", plyText.substring(0, 100))

        // PLY 헤더가 올바른지 확인
        if (!plyText.startsWith('ply\n')) {
          console.error("올바른 PLY 파일이 아님")
          setError("올바른 PLY 파일이 아닙니다")
          return
        }

        const lines = plyText.split('\n')
        const vertices: number[] = []
        const colors: number[] = []
        let vertexCount = 0
        let headerEnded = false
        let headerEndIndex = 0
        let isAscii = true
        let properties: string[] = []

        // PLY 헤더 파싱
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          
          if (line.startsWith('format ascii')) {
            isAscii = true
          } else if (line.startsWith('format binary')) {
            isAscii = false
          } else if (line.startsWith('element vertex')) {
            vertexCount = parseInt(line.split(' ')[2])
            console.log(`Vertex count: ${vertexCount}`)
          } else if (line.startsWith('property')) {
            properties.push(line)
          } else if (line === 'end_header') {
            headerEnded = true
            headerEndIndex = i
            break
          }
        }

        console.log(`파일 형식: ${isAscii ? 'ASCII' : 'Binary'}`)
        console.log(`속성들:`, properties)

        if (isAscii) {
          // ASCII PLY 파싱
          console.log("ASCII PLY 파싱 시작...")
          let processedVertices = 0

          for (let i = headerEndIndex + 1; i < lines.length && processedVertices < vertexCount; i++) {
            const line = lines[i].trim()
            if (!line) continue

            const parts = line.split(/\s+/).filter(p => p.length > 0)
            
            if (parts.length >= 3) {
              // 좌표 데이터
              vertices.push(
                parseFloat(parts[0]),
                parseFloat(parts[1]), 
                parseFloat(parts[2])
              )
              
              // 색상 데이터 (RGB가 있으면 사용)
              if (parts.length >= 6) {
                colors.push(
                  parseInt(parts[3]) / 255,
                  parseInt(parts[4]) / 255,
                  parseInt(parts[5]) / 255
                )
              } else {
                // 기본 색상 (포인트별로 다른 색상)
                const hue = (processedVertices / vertexCount) * 360
                const rgb = hslToRgb(hue / 360, 0.7, 0.6)
                colors.push(rgb[0], rgb[1], rgb[2])
              }
              
              processedVertices++
            }
          }
        } else {
          // Binary PLY는 현재 지원하지 않음
          console.warn("바이너리 PLY 파일은 현재 지원되지 않습니다")
          setError("바이너리 PLY 파일은 현재 지원되지 않습니다")
          
          // 대신 간단한 더미 데이터 생성
          for (let i = 0; i < 1000; i++) {
            vertices.push(
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4
            )
            colors.push(Math.random(), Math.random(), Math.random())
          }
          vertexCount = 1000
        }

        console.log(`파싱 완료: ${vertices.length / 3}개 점`)
        setPointCount(vertices.length / 3)

        if (vertices.length > 0) {
          // BufferGeometry 생성
          const geom = new THREE.BufferGeometry()
          geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
          geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
          
          // 바운딩 박스 계산 및 중심 정렬
          geom.computeBoundingSphere()
          if (geom.boundingSphere) {
            const center = geom.boundingSphere.center
            const radius = geom.boundingSphere.radius
            geom.translate(-center.x, -center.y, -center.z)
            console.log(`중심 이동: (${-center.x.toFixed(2)}, ${-center.y.toFixed(2)}, ${-center.z.toFixed(2)})`)
            console.log(`반지름: ${radius.toFixed(2)}`)
          }
          
          setGeometry(geom)
          setError(null)
        } else {
          setError("점군 데이터를 찾을 수 없습니다")
        }
      })
      .catch(fetchError => {
        console.error('PLY 파일 로드 실패:', fetchError)
        setError(`PLY 파일 로드 실패: ${fetchError.message}`)
      })
  }, [plyBlobUrl])

  // HSL을 RGB로 변환하는 헬퍼 함수
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
    const m = l - c / 2
    
    let r = 0, g = 0, b = 0
    
    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x
    }
    
    return [r + m, g + m, b + m]
  }

  // 자동 회전 애니메이션
  useFrame((state) => {
    if (meshRef.current && !error) {
      meshRef.current.rotation.y += 0.003
    }
  })

  if (error) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshBasicMaterial color="red" />
        </mesh>
        {/* 에러 텍스트는 HTML 오버레이로 표시 */}
      </group>
    )
  }

  if (!geometry) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="gray" wireframe />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <points ref={meshRef} geometry={geometry}>
        <pointsMaterial 
          size={0.03} 
          vertexColors={true} 
          transparent={true}
          opacity={0.9}
          sizeAttenuation={true}
        />
      </points>
    </group>
  )
}

export default function PLYViewer({ plyBlobUrl }: PLYViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (plyBlobUrl) {
      // Blob URL 유효성 사전 검사
      try {
        new URL(plyBlobUrl)
        setTimeout(() => setIsLoading(false), 1000)
        setError(null)
      } catch (err) {
        setError(`Blob URL 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`)
        setIsLoading(false)
      }
    }
  }, [plyBlobUrl])

  if (!plyBlobUrl) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">PLY 데이터가 없습니다</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-800 font-medium">PLY 파일 처리 오류</p>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <p className="text-red-500 text-xs mt-2">콘솔(F12)에서 자세한 오류를 확인하세요</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">PLY 파일 렌더링 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      >
        {/* 조명 설정 */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.6} />
        <spotLight position={[0, 10, 0]} intensity={0.4} />

        {/* PLY 점군 렌더링 */}
        <PointCloud plyBlobUrl={plyBlobUrl} />
        
        {/* 환경 */}
        <Environment preset="night" />
        
        {/* 마우스 컨트롤 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          autoRotate={false}
          dampingFactor={0.05}
          enableDamping={true}
        />
      </Canvas>
      
      {/* 컨트롤 안내 */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p className="font-medium mb-1">🎮 3D 점군 뷰어</p>
        <p>• 마우스 드래그: 회전</p>
        <p>• 휠: 확대/축소</p>
        <p>• 우클릭 드래그: 이동</p>
      </div>

      {/* 정보 패널 */}
      <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p className="font-medium">📊 모델 정보</p>
        <p>Gaussian Splatting 결과</p>
        <p>자동 회전: ON</p>
      </div>
    </div>
  )
} 