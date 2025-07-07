# Backend - Flask API Server

3D Gaussian Splatting을 위한 Flask 백엔드 서버입니다.

## 🏗️ **아키텍처**

```
Flask API Server
├── 이미지 수신 (FormData)
├── COLMAP 처리 (Structure from Motion)
├── 3DGS 훈련 (gsplat_3dgut)
└── PLY 파일 생성 및 전송
```

## 📋 **필수 설치 프로그램**

### 1. **COLMAP**
```bash
# Windows에서 COLMAP 설치
# 다운로드: https://github.com/colmap/colmap/releases
# 설치 경로: C:\Users\PC\colmap-x64-windows-cuda\
```

### 2. **gsplat (3D Gaussian Splatting)**
```bash
# Conda 환경 생성
conda create -n gsplat python=3.8
conda activate gsplat

# gsplat 설치
git clone https://github.com/nerfstudio-project/gsplat.git
cd gsplat
pip install -e .
```

### 3. **Flask 의존성**
```bash
pip install flask flask-cors pillow numpy
pip install pyngrok  # ngrok 연동용
```

## 🚀 **서버 실행**

### **방법 1: 로컬 실행**
```bash
cd backend/
python appp.py
```

### **방법 2: ngrok으로 외부 접속 허용**
```bash
# 터미널 1: Flask 서버
python appp.py

# 터미널 2: ngrok
ngrok http 5000 --domain=3dgs.ngrok.app
```

## 📡 **API 엔드포인트**

### **POST /process_images**

**요청:**
```http
POST /process_images
Content-Type: multipart/form-data

Body: FormData with 'images' field containing image files
```

**응답:**
```http
Content-Type: application/octet-stream
Body: Binary PLY file data
```

**처리 과정:**
1. 이미지 파일들을 임시 폴더에 저장
2. COLMAP으로 카메라 포즈 및 포인트 클라우드 생성
3. gsplat으로 Gaussian Splatting 훈련 (30,000 iterations)
4. 최종 PLY 파일 생성 및 반환

## 🗂️ **폴더 구조**

```
C:\Temp\3dgs_processing\[timestamp]\
├── images\                    # 업로드된 원본 이미지
├── output\
│   ├── colmap_data\
│   │   ├── images\           # COLMAP 입력 이미지
│   │   ├── images_2\         # 다운샘플링된 이미지  
│   │   └── sparse\           # COLMAP 출력 (카메라 포즈 등)
│   └── final_trained_model\
│       └── ply\
│           └── point_cloud_29999.ply  # 최종 3DGS 결과
```

## ⚙️ **설정 파일**

### **config.py** (예시)
```python
import os

class Config:
    # 경로 설정
    COLMAP_PATH = r"C:\Users\PC\colmap-x64-windows-cuda\COLMAP.exe"
    GSPLAT_PATH = r"C:\Users\PC\gsplat"
    TEMP_PATH = r"C:\Temp\3dgs_processing"
    
    # 처리 설정
    MAX_IMAGES = 50
    COLMAP_QUALITY = "high"
    GSPLAT_ITERATIONS = 30000
    
    # 서버 설정
    FLASK_PORT = 5000
    NGROK_DOMAIN = "3dgs.ngrok.app"
```

## 🔧 **주요 함수들**

### **이미지 처리**
```python
def process_images(image_files):
    """이미지들을 3D 모델로 변환"""
    # 1. 임시 폴더 생성
    # 2. 이미지 저장
    # 3. COLMAP 실행
    # 4. gsplat 훈련
    # 5. PLY 파일 반환
```

### **COLMAP 실행**
```python
def run_colmap(image_folder, output_folder):
    """COLMAP 파이프라인 실행"""
    # feature_extractor
    # exhaustive_matcher  
    # mapper
    # image_undistorter
```

### **3DGS 훈련**
```python
def train_gaussian_splatting(colmap_data, output_folder):
    """Gaussian Splatting 훈련"""
    # gsplat 라이브러리 사용
    # 30,000 iterations 훈련
    # PLY 파일 생성
```

## 🐛 **트러블슈팅**

### **COLMAP 오류**
```
Error: COLMAP failed to extract features
```
**해결책**: 이미지 품질 확인, CUDA 드라이버 업데이트

### **메모리 부족**
```
Error: CUDA out of memory
```
**해결책**: 이미지 수 줄이기, GPU 메모리 정리

### **gsplat 오류**
```
Error: gsplat training failed
```
**해결책**: Conda 환경 확인, 의존성 재설치

## 📊 **성능 최적화**

- **이미지 전처리**: 리사이즈, 압축
- **COLMAP 설정**: 품질 vs 속도 조절
- **gsplat 파라미터**: iteration 수, 학습률 조정
- **메모리 관리**: 배치 처리, 임시 파일 정리

## 🔒 **보안 고려사항**

- 파일 업로드 크기 제한
- 허용된 파일 형식만 처리
- 임시 파일 자동 정리
- ngrok 도메인 보안 설정 