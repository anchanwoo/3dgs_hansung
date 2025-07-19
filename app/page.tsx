"use client"

import { useState } from 'react';

export default function PlyUploader() {
  const [loading, setLoading] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // https://3dgs.ngrok.app

  const handleFiles = async (files: FileList | File[]) => {
    setLoading(true);
    try {
      // 1) FormData에 이미지 파일들 담기
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('images', file));

      // 2) /process_images 호출 → JSON { download_url } 받기
      const uploadRes = await fetch(`${API_BASE}/process_images`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error || `Upload failed: ${uploadRes.status}`);
      }
      const { download_url } = await uploadRes.json();

      // 3) download_url로 PLY 다운로드 → Blob
      const plyRes = await fetch(download_url, {
        method: 'GET',
        mode: 'cors',
      });
      if (!plyRes.ok) {
        throw new Error(`Download failed: ${plyRes.status}`);
      }
      const plyBlob = await plyRes.blob();

      // 4) Blob을 링크로 만들어 자동 다운로드
      const url = URL.createObjectURL(plyBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene.ply';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (e: any) {
      console.error('Upload/Download error:', e);
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>3DGS 이미지 업로드 및 PLY 다운로드</h2>
      <input
        type="file"
        multiple
        accept="image/*"
        disabled={loading}
        onChange={(evt) => handleFiles(evt.target.files!)}
      />
      {loading && <p>처리 중… 잠시만 기다려 주세요.</p>}
    </div>
  );
}
