export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5E6D3] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-700">결과 페이지 로딩 중...</p>
      </div>
    </div>
  )
}
