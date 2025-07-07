# 3D Gaussian Splatting 웹 애플리케이션

사용자가 웹 브라우저에서 여러 장의 이미지를 업로드하면, 백그라운드에서 3D Gaussian Splatting (3DGS) 기술로 3D 모델을 자동 생성하고, 생성된 3D 모델(.ply 파일)을 웹 브라우저에서 실시간으로 렌더링하여 보여주는 웹 애플리케이션입니다.

## 🎯 프로젝트 개요

### 주요 기능
- **이미지 업로드**: 드래그 & 드롭으로 다중 이미지 업로드
- **3D 재구성**: COLMAP + Gaussian Splatting으로 3D 모델 생성
- **실시간 렌더링**: 웹 브라우저에서 3D 점군 모델 뷰어
- **파일 다운로드**: 생성된 .ply 파일 다운로드

### 처리 시간
- **일반적인 경우**: 20-30분 (RTX 4070 Ti SUPER 기준)
- **이미지 수량에 따라 변동**: 더 많은 이미지 = 더 긴 처리 시간

## 🏗️ 아키텍처

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   프론트엔드       │────│    백엔드 API      │────│   3DGS 엔진      │
│  (Next.js)      │    │    (Flask)       │    │ (gsplat+COLMAP) │
│                 │    │                  │    │                 │
│ • 이미지 업로드    │    │ • 이미지 수신      │    │ • COLMAP 처리    │
│ • 3D 뷰어        │    │ • 3DGS 처리 관리   │    │ • 가우시안 학습   │
│ • 파일 다운로드    │    │ • .ply 파일 전송   │    │ • .ply 생성      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    localhost:3000          3dgs.ngrok.app              로컬 실행
```

### 기술 스택
- **프론트엔드**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **3D 렌더링**: React Three Fiber, Three.js
- **백엔드**: Flask (Python)
- **3DGS 엔진**: gsplat_3dgut, COLMAP
- **네트워크**: ngrok (고정 도메인)

## 📁 프로젝트 구조

```
웹페이즈 초안 (수정)/
├── app/
│   ├── api/upload/route.ts         # Flask API 연동
│   ├── page.tsx                    # 메인 페이지
│   ├── loading/page.tsx            # 로딩 페이지
│   ├── result/page.tsx             # 결과 페이지
│   └── layout.tsx                  # 루트 레이아웃
├── components/
│   ├── image-uploader.tsx          # 이미지 업로더
│   ├── 3d-viewer.tsx              # 3D 뷰어
│   ├── ply-viewer.tsx             # PLY 전용 뷰어
│   └── ui/                        # UI 컴포넌트들
├── package.json                   # 의존성 관리
└── README.md                      # 이 파일
```

## 🛠️ 설치 및 설정

### 1. 백엔드 설정 (Flask API)

#### 필수 경로 설정
```
C:\Users\PC\3DGS_WebApp_API\appp.py          # Flask 서버
C:\Users\PC\colmap-x64-windows-cuda\         # COLMAP 설치 경로
C:\Users\PC\gsplat\                          # gsplat 설치 경로
C:\Temp\3dgs_processing\                     # 임시 처리 폴더
```

#### 백엔드 실행
```bash
# gsplat Conda 환경에서 실행
cd C:\Users\PC\3DGS_WebApp_API\
python appp.py
```

#### ngrok 설정
```bash
# 고정 도메인으로 ngrok 실행
ngrok http 5000 --domain=3dgs.ngrok.app
```

### 2. 프론트엔드 설정 (Next.js)

#### 의존성 설치
```bash
# 프로젝트 루트에서
npm install --legacy-peer-deps
npm install --save-dev @types/three @types/node --legacy-peer-deps
```

#### 프론트엔드 실행
```bash
npm run dev
```

## 🚀 사용 방법

### 1. 서버 실행 확인
```bash
# 백엔드 상태 확인
netstat -an | findstr :5000

# 프론트엔드 상태 확인  
netstat -an | findstr :3000

# ngrok 상태 확인
curl https://3dgs.ngrok.app
```

### 2. 웹 애플리케이션 사용

#### Step 1: 이미지 준비
- **권장 이미지**: 동일한 공간을 다양한 각도에서 촬영
- **이미지 수량**: 10-50장 (더 많을수록 품질 향상)
- **겹침률**: 인접 이미지 간 50-70% 겹침 권장
- **파일 형식**: JPG, PNG, WebP

#### Step 2: 웹페이지 접속
```
http://localhost:3000
```

#### Step 3: 이미지 업로드
1. 드래그 & 드롭으로 이미지 업로드
2. 또는 "파일 선택" 버튼 클릭
3. 업로드된 이미지 미리보기 확인

#### Step 4: 3D 재구성 시작
1. "3D 재구성 시작" 버튼 클릭
2. **중요**: 20-30분 대기 필요
3. 브라우저 탭을 닫지 말고 기다리기

#### Step 5: 결과 확인
1. 로딩 완료 후 자동으로 결과 페이지 이동
2. **3D 뷰어 모드**: 실시간 3D 점군 모델 렌더링
   - 자동 회전 애니메이션
   - 마우스 드래그로 회전/확대/이동
   - 점군 색상과 크기 자동 최적화
3. **정보 모드**: 파일 정보와 다운로드 안내
4. "PLY 파일 다운로드" 버튼으로 .ply 파일 저장

## 🔧 문제 해결

### 일반적인 문제들

#### 1. "연결 실패" 오류
```bash
# ngrok 상태 확인
curl https://3dgs.ngrok.app

# Flask 서버 재시작
cd C:\Users\PC\3DGS_WebApp_API\
python appp.py
```

#### 2. "업로드 실패" 오류
- **파일 크기**: 너무 큰 이미지는 압축 후 업로드
- **파일 형식**: JPG, PNG, WebP만 지원
- **네트워크**: 안정적인 인터넷 연결 필요

#### 3. "타임아웃" 오류
- **30분 초과시**: 자동 타임아웃
- **해결방법**: 이미지 수량 줄이거나 해상도 낮추기

#### 4. "3D 모델이 안 보임"
- **브라우저 호환성**: Chrome, Firefox 권장
- **WebGL 지원**: 그래픽 드라이버 업데이트

### 개발자 도구 활용

#### 네트워크 탭 확인
```javascript
// 브라우저 개발자 도구(F12)에서 실행
fetch('/api/upload', {method: 'POST'}) // API 연결 테스트
```

#### 콘솔 로그 확인
- **업로드 진행률**: "Uploading X images to Flask API..."
- **처리 상태**: "Received .ply file, size: X bytes"
- **오류 메시지**: 빨간색으로 표시되는 에러들

## 📊 성능 최적화

### 이미지 최적화
- **해상도**: 1920x1080 권장 (4K는 처리 시간 증가)
- **압축률**: JPEG 품질 80-90% 권장
- **개수**: 20-30장이 품질과 속도의 균형점

### 시스템 요구사항
- **GPU**: NVIDIA RTX 시리즈 권장
- **RAM**: 16GB 이상
- **저장공간**: 처리 중 10-20GB 여유공간 필요

## 📝 개발 노트

### API 엔드포인트
```
POST https://3dgs.ngrok.app/process_images
Content-Type: multipart/form-data
Body: FormData with 'images' field
Response: Binary .ply file data
```

### 처리 단계
1. **이미지 수신**: FormData로 이미지 파일들 받기
2. **COLMAP 처리**: 특징점 추출 → 매칭 → 3D 재구성
3. **가우시안 학습**: gsplat으로 30,000 iteration 학습
4. **파일 생성**: point_cloud_29999.ply 파일 생성
5. **응답 전송**: 바이너리 스트림으로 파일 전송

### 파일 경로
```
C:\Temp\3dgs_processing\[세션ID]\
├── images\                    # 원본 이미지
├── output\
│   ├── colmap_data\
│   │   ├── images\           # COLMAP용 이미지
│   │   ├── images_2\         # 다운샘플링 이미지
│   │   └── sparse\           # COLMAP 결과
│   └── final_trained_model\
│       └── ply\
│           └── point_cloud_29999.ply  # 최종 결과
```

## 🎉 완성된 기능들

- ✅ **이미지 업로드**: 드래그 & 드롭, 다중 선택
- ✅ **백엔드 연동**: Flask API 완전 연동  
- ✅ **3D 처리**: COLMAP + Gaussian Splatting
- ✅ **진행률 표시**: 단계별 로딩 애니메이션
- ✅ **실시간 3D 뷰어**: PLY 점군 렌더링
  - PLY 파일 파싱 및 점군 렌더링
  - 자동 회전 애니메이션
  - 마우스 인터랙션 (회전/확대/이동)
  - 색상 및 크기 자동 최적화
- ✅ **뷰어 모드 전환**: 3D 뷰어 ↔ 파일 정보
- ✅ **파일 다운로드**: .ply 파일 저장
- ✅ **에러 처리**: 타임아웃, 네트워크 오류 처리

## 🔮 향후 개선 계획

- **실시간 진행률**: WebSocket으로 실제 처리 상태 표시
- **배치 처리**: 여러 작업 큐 관리
- **결과 저장**: 데이터베이스에 결과 저장
- **품질 향상**: 더 고급 렌더링 옵션
- **모바일 지원**: 반응형 모바일 인터페이스

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. **백엔드 로그**: appp.py 콘솔 출력
2. **프론트엔드 로그**: 브라우저 개발자 도구 (F12)
3. **네트워크 상태**: ngrok 및 로컬 서버 상태
4. **시스템 리소스**: GPU 메모리, 디스크 공간

**최종 업데이트**: 2025년 7월 7일 