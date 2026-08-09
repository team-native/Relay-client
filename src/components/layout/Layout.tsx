import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Toast from '../ui/Toast';

const TOAST_DURATION = 2500;

export interface LayoutContext {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  showToast: (message: string) => void;
}

export default function Layout() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 홈은 카드 그리드가 화면을 꽉 채우도록 더 넓게 써요.
  const isHome = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(message: string) {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION);
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className={`mx-auto px-8 py-10 ${isHome ? 'max-w-[1600px]' : 'max-w-5xl'}`}>
        <Outlet context={{ searchQuery, setSearchQuery, showToast } satisfies LayoutContext} />
      </main>
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
