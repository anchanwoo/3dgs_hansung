# 3D Gaussian Splatting 웹 애플리케이션

이미지에서 3D 모델을 생성하는 웹 애플리케이션입니다. 사용자가 여러 장의 이미지를 업로드하면 3D Gaussian Splatting 기술을 사용하여 실시간으로 3D 점군 모델을 생성하고 브라우저에서 렌더링합니다.

## 🎯 **주요 기능**

- **🖼️ 이미지 업로드**: 드래그 & 드롭으로 다중 이미지 업로드
- **⚡ 실시간 처리**: 3D Gaussian Splatting을 통한 3D 모델 생성
- **🎮 3D 뷰어**: Three.js 기반 실시간 점군 렌더링
- **📱 반응형 UI**: 모바일/데스크톱 호환 인터페이스
- **💾 파일 다운로드**: 생성된 PLY 파일 다운로드

## 🏗️ **아키텍처**

```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│   Frontend      │ ──────────────► │    Backend       │
│   (Next.js)     │                 │    (Flask)       │
│                 │                 │                  │
│ • 이미지 업로드   │                 │ • COLMAP         │
│ • 3D 뷰어       │ ◄────────────── │ • 3DGS 처리      │
│ • PLY 렌더링    │    PLY 파일     │ • PLY 생성       │
└─────────────────┘                 └──────────────────┘
```

### **기술 스택**

**프론트엔드:**
- **Next.js 15** (React 19)
- **TypeScript**
- **Tailwind CSS**
- **React Three Fiber** (3D 렌더링)
- **Lucide React** (아이콘)

**백엔드:**
- **Flask** (Python)
- **COLMAP** (Structure from Motion)
- **gsplat_3dgut** (3D Gaussian Splatting)
- **ngrok** (외부 접속)

## 🚀 **설치 및 실행**

### **프론트엔드 설정**

```bash
# 의존성 설치
npm install --legacy-peer-deps

# 개발 서버 실행
npm run dev
```

### **백엔드 설정**

백엔드는 별도의 Flask 서버에서 실행됩니다:
- COLMAP을 통한 카메라 포즈 추정
- 3D Gaussian Splatting 훈련
- PLY 파일 생성 및 반환

## 📱 **사용 방법**

### 1. **이미지 업로드**
- 브라우저에서 `http://localhost:3000` 접속
- 동일한 공간을 다양한 각도에서 촬영한 이미지 업로드
- **권장**: 7-10장의 선명한 이미지

### 2. **3D 처리 대기**
- 처리 시간: 약 20-30분 (RTX 4070 Ti SUPER 기준)
- 실시간 진행 상황 표시

### 3. **결과 확인**
- 3D 점군 뷰어에서 결과 확인
- 마우스로 회전/확대/이동 가능
- PLY 파일 다운로드

## 📊 **현재 상황 및 제한사항**

### ✅ **완성된 기능**
- [x] 이미지 업로드 시스템
- [x] Flask API 연동
- [x] 3D 점군 렌더링
- [x] PLY 파일 처리 (ASCII/Binary)
- [x] 파일 다운로드
- [x] 반응형 UI/UX

### ⚠️ **현재 제한사항**
- **이미지 수 제한**: 현재 7-10장 권장 (더 많으면 메모리 부족)
- **처리 시간**: 20-30분 소요
- **파일 크기**: 대용량 PLY 파일 시 브라우저 제한

### 🔧 **알려진 이슈**
1. **14장 이상 처리 시**: `3DGS training process terminated prematurely` 오류
2. **대용량 파일**: Base64 인코딩 시 스택 오버플로우 (해결됨)
3. **SessionStorage 제한**: Blob URL 방식으로 해결됨

## 🎯 **성능 비교**

| 환경 | 이미지 수 | 처리 시간 | 성공률 |
|------|-----------|----------|--------|
| 로컬 직접 | 50장+ | 10-20분 | 100% |
| 웹앱 구조 | 7-10장 | 20-30분 | 95% |
| 웹앱 구조 | 14장+ | 실패 | 0% |

## 🔮 **향후 계획**

### **단기 (1-2주)**
- [ ] 메모리 최적화로 20-30장 처리 가능
- [ ] 배치 처리 구현 (10장씩 분할)
- [ ] 진행률 WebSocket 실시간 업데이트

### **중기 (1-2개월)**
- [ ] Google Colab Pro 연동
- [ ] 클라우드 GPU 인스턴스 지원
- [ ] Progressive 3DGS 구현

### **장기 (3-6개월)**
- [ ] 다중 사용자 지원
- [ ] 3D 모델 갤러리
- [ ] 고급 렌더링 옵션

## 📁 **프로젝트 구조**

```
웹페이즈 초안 (수정)/
├── app/                          # Next.js App Router
│   ├── api/upload/route.ts      # 이미지 업로드 API
│   ├── page.tsx                 # 메인 페이지
│   ├── loading/page.tsx         # 로딩 페이지
│   └── result/page.tsx          # 결과 페이지
├── components/
│   ├── ply-viewer.tsx           # 3D PLY 뷰어
│   ├── image-uploader.tsx       # 이미지 업로드
│   └── ui/                      # shadcn/ui 컴포넌트
├── public/                      # 정적 파일
└── README.md                    # 프로젝트 문서
```

## 🛠️ **트러블슈팅**

### **Base64 디코딩 오류**
```
InvalidCharacterError: Failed to execute 'atob'
```
**해결책**: Base64 문자열 정리 및 패딩 처리 구현됨

### **SessionStorage 용량 초과**
```
QuotaExceededError: Setting the value of 'plyData' exceeded the quota
```
**해결책**: Blob URL 방식으로 변경됨

### **3DGS 처리 실패**
```
3DGS training process terminated prematurely
```
**해결책**: 이미지 수를 7-10장으로 제한

## 🤝 **기여하기**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 🙏 **감사의 말**

- [3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting) 연구팀
- [COLMAP](https://colmap.github.io/) 개발팀
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) 커뮤니티

---

**⭐ 이 프로젝트가 유용했다면 Star를 눌러주세요!** 