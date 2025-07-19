# 구글 코랩 환경 설정 가이드

## 1. 코랩 프로 구독
- https://colab.research.google.com/signup
- 월 $9.99 결제

## 2. 코랩 노트북 생성
```python
# GPU 확인
!nvidia-smi

# 필수 패키지 설치
!pip install flask pyngrok requests pillow

# COLMAP 설치
!apt-get update
!apt-get install -y colmap

# gsplat 설치
!pip install gsplat
```

## 3. 백엔드 코드 업로드
```python
# GitHub에서 코드 다운로드
!git clone https://github.com/your-repo/3dgs-webapp.git
%cd 3dgs-webapp/backend

# Flask 서버 실행
from pyngrok import ngrok
import threading

# ngrok 터널 생성
ngrok.set_auth_token("your_token_here")
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")

# Flask 서버 실행
!python appp.py
```

## 4. 프론트엔드 URL 변경
```typescript
// app/api/upload/route.ts
const FLASK_API_URL = 'your_colab_ngrok_url'
```

## 5. 테스트
- 50장 이미지 업로드 테스트
- 처리 시간 측정
- 메모리 사용량 확인 