import { type NextRequest, NextResponse } from "next/server"

// 실제 Flask API URL (ngrok 고정 주소)
const FLASK_API_URL = "https://3dgs.ngrok.app"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("images") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    console.log(`Uploading ${files.length} images to Flask API...`)

    // Flask API에 이미지 전송
    const flaskFormData = new FormData()
    files.forEach((file) => {
      flaskFormData.append("images", file)
    })

    console.log("Sending request to Flask API...")
    const response = await fetch(`${FLASK_API_URL}/process_images`, {
      method: "POST",
      body: flaskFormData,
      // 타임아웃 설정 (30분)
      signal: AbortSignal.timeout(30 * 60 * 1000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Flask API error:", errorText)
      throw new Error(`Flask API request failed: ${response.status}`)
    }

    // .ply 파일 바이너리 데이터 받기
    const plyBuffer = await response.arrayBuffer()
    
    console.log(`Received .ply file, size: ${plyBuffer.byteLength} bytes`)

    // 바이너리 데이터를 안전하게 Base64 인코딩
    const uint8Array = new Uint8Array(plyBuffer)
    console.log(`인코딩할 데이터 크기: ${uint8Array.length} bytes`)
    
    // 더 작은 청크로 나누어 인코딩 (스택 오버플로우 방지)
    let base64Data = ""
    const chunkSize = 1024 // 1KB 청크로 줄임
    
    try {
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize)
        const chunkArray = Array.from(chunk)
        const chunkString = String.fromCharCode.apply(null, chunkArray)
        base64Data += btoa(chunkString)
      }
      
      console.log(`Base64 인코딩 완료: ${base64Data.length} 문자`)
      
      // Base64 문자열 유효성 검증
      if (base64Data.length % 4 !== 0) {
        // 패딩 추가
        base64Data += '='.repeat(4 - (base64Data.length % 4))
      }
      
    } catch (encodingError) {
      console.error("Base64 인코딩 실패:", encodingError)
      throw new Error(`Base64 인코딩 실패: ${encodingError}`)
    }
    const sessionId = Date.now().toString()

    return NextResponse.json({
      success: true,
      message: "Images processed successfully",
      plyData: base64Data,
      sessionId: sessionId,
      fileSize: plyBuffer.byteLength,
    })
  } catch (error) {
    console.error("Upload API error:", error)
    
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          error: "Processing timeout - 3D reconstruction took too long",
          success: false,
        },
        { status: 408 },
      )
    }
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
      { status: 500 },
    )
  }
}
