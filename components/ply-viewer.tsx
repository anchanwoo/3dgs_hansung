"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import * as THREE from "three"

interface PLYViewerProps {
  plyBlobUrl: string
}

// PLY 점군 렌더링 컴포넌트
function PointCloud({ plyBlobUrl }: { plyBlobUrl: string }) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null)
  const meshRef = useRef<THREE.Points>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!plyBlobUrl) return

    const loadPLYData = async () => {
      try {
        console.log("Blob URL에서 PLY 데이터 로딩 시작...")
        
        const response = await fetch(plyBlobUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const binaryData = new Uint8Array(arrayBuffer)
        console.log(`바이너리 데이터 크기: ${binaryData.length} bytes`)

        // 텍스트로 변환하여 헤더 확인
        const textDecoder = new TextDecoder('utf-8', { fatal: false })
        const plyText = textDecoder.decode(binaryData)
        
        console.log("PLY 헤더 확인 중...")
        console.log("첫 100자:", plyText.substring(0, 100))

        // PLY 헤더가 올바른지 확인
        if (!plyText.startsWith('ply\n')) {
          throw new Error("올바른 PLY 파일이 아닙니다")
        }

        const lines = plyText.split('\n')
        const vertices: number[] = []
        const colors: number[] = []
        let vertexCount = 0
        let headerEndIndex = 0
        let isAscii = true

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
          } else if (line === 'end_header') {
            headerEndIndex = i
            break
          }
        }

        console.log(`파일 형식: ${isAscii ? 'ASCII' : 'Binary'}`)

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
          // Binary PLY 파싱
          console.log("바이너리 PLY 파싱 시작...")
          
          // 헤더 끝 위치 찾기 (바이너리에서)
          let headerEndPos = 0
          const headerText = textDecoder.decode(binaryData.slice(0, Math.min(2048, binaryData.length)))
          const headerEndIndex = headerText.indexOf('end_header\n')
          if (headerEndIndex !== -1) {
            headerEndPos = headerEndIndex + 'end_header\n'.length
          }
          
          console.log(`헤더 끝 위치: ${headerEndPos}`)
          
          // 바이너리 데이터 시작점
          const binaryStart = headerEndPos
          const binaryVertexData = binaryData.slice(binaryStart)
          
          console.log(`바이너리 vertex 데이터 크기: ${binaryVertexData.length} bytes`)
          
          // 바이너리 PLY 파싱 (little-endian float32 가정)
          const dataView = new DataView(binaryVertexData.buffer, binaryVertexData.byteOffset)
          let processedVertices = 0
          
          // 각 vertex는 보통 12 bytes (x,y,z: 4bytes each) 또는 더 많음 (색상 포함시)
          // 속성에 따라 달라지지만 기본적으로 x,y,z,r,g,b (6 * 4 = 24 bytes) 가정
          const bytesPerVertex = 24 // 기본적으로 24 bytes (x,y,z,r,g,b) 가정
          const maxVertices = Math.min(vertexCount, Math.floor(binaryVertexData.length / bytesPerVertex))
          
          console.log(`예상 vertex당 바이트: ${bytesPerVertex}, 최대 처리 가능 vertices: ${maxVertices}`)
          
          try {
            for (let i = 0; i < maxVertices; i++) {
              const offset = i * bytesPerVertex
              
              if (offset + 12 > binaryVertexData.length) break
              
              // X, Y, Z 좌표 (little-endian float32)
              const x = dataView.getFloat32(offset, true)
              const y = dataView.getFloat32(offset + 4, true)
              const z = dataView.getFloat32(offset + 8, true)
              
              // 유효한 좌표인지 확인
              if (isFinite(x) && isFinite(y) && isFinite(z)) {
                vertices.push(x, y, z)
                
                // 색상 정보가 있으면 읽기
                if (bytesPerVertex >= 24 && offset + 24 <= binaryVertexData.length) {
                  try {
                    const r = dataView.getUint8(offset + 12) / 255
                    const g = dataView.getUint8(offset + 13) / 255
                    const b = dataView.getUint8(offset + 14) / 255
                    colors.push(r, g, b)
                  } catch {
                    // 색상 읽기 실패시 기본색상
                    const hue = (processedVertices / maxVertices) * 360
                    const rgb = hslToRgb(hue / 360, 0.7, 0.6)
                    colors.push(rgb[0], rgb[1], rgb[2])
                  }
                } else {
                  // 기본 색상 (그라디언트)
                  const hue = (processedVertices / maxVertices) * 360
                  const rgb = hslToRgb(hue / 360, 0.7, 0.6)
                  colors.push(rgb[0], rgb[1], rgb[2])
                }
                
                processedVertices++
              }
            }
          } catch (parseError) {
            console.error("바이너리 파싱 중 오류:", parseError)
            
            // 파싱 실패시 더미 데이터로 폴백
            for (let i = 0; i < 1000; i++) {
              vertices.push(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
              )
              colors.push(Math.random(), Math.random(), Math.random())
            }
          }
        }

        console.log(`파싱 완료: ${vertices.length / 3}개 점`)

        if (vertices.length > 0) {
          // 업샘플링/노이즈/랜덤 색상/자동 회전 등 관련 코드 완전 제거
          // vertices, colors 그대로 BufferGeometry에 사용
          const geom = new THREE.BufferGeometry()
          geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
          geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
          setGeometry(geom)
          setError(null)
        } else {
          setError("점군 데이터를 찾을 수 없습니다")
        }
      } catch (error) {
        console.error('PLY 파일 로드 실패:', error)
        setError(`PLY 파일 로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
      }
    }

    loadPLYData()
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
  // useFrame((state) => {
  //   if (meshRef.current && !error) {
  //     meshRef.current.rotation.y += 0.003
  //   }
  // })

  if (error) {
    return (
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.5, 0.1]} />
          <meshBasicMaterial color="red" />
        </mesh>
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
        frameloop="demand"
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <pointLight position={[-10, -10, -5]} intensity={0.6} />
        <spotLight position={[0, 10, 0]} intensity={0.4} />

        <PointCloud plyBlobUrl={plyBlobUrl} />
        
        <Environment preset="night" />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          autoRotate={false}
          dampingFactor={0.05}
          enableDamping={true}
          onChange={() => {
            // invalidate()를 호출하여 카메라 조작 시만 렌더링
            const { invalidate } = useThree();
            invalidate();
          }}
        />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p className="font-medium mb-1">🎮 3D 점군 뷰어</p>
        <p>• 마우스 드래그: 회전</p>
        <p>• 휠: 확대/축소</p>
        <p>• 우클릭 드래그: 이동</p>
      </div>

      <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-lg text-sm">
        <p className="font-medium">📊 모델 정보</p>
        <p>Gaussian Splatting 결과</p>
        <p>자동 회전: ON</p>
      </div>
    </div>
  )
} 