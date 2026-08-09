import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login/Login";
import { Signup } from "./pages/Signup/Signup";
import { VerifyEmail } from "./pages/VerifyEmail/VerifyEmail";

function App() {
  return (
    <BrowserRouter>
      {/* 최상위 컨테이너: 화면 전체 높이 및 중앙 정렬 */}
      <div className="min-h-screen w-full bg-[#f8f9fa] flex items-center justify-center p-4 sm:p-8 font-sans antialiased">
        {/* Routes 감싸는 영역: 폭 고정 및 중앙 유지 */}
        <div className="w-full max-w-[480px] flex justify-center">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/" element={<Navigate to="/signup" replace />} />
            <Route path="*" element={<Navigate to="/signup" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;