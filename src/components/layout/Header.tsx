import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: '홈', path: '/' },
  { label: '공지사항', path: '/notices' },
  { label: '마이페이지', path: '/mypage' },
];

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const location = useLocation();
  const showSearch = !location.pathname.startsWith('/mypage');
  const { isLoggedIn, login } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 h-16 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-10">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Relay+" className="w-9 h-9" />
          <span className="font-bold text-lg">Relay+</span>
        </Link>

        <nav className="flex items-center gap-8 h-16">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative h-full flex items-center text-sm ${
                  isActive ? 'text-[#FFDD86] font-semibold' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] rounded-full bg-[#FFDD86]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="제목으로 검색"
              className="pl-9 pr-4 py-2 w-56 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FFDD86] transition-colors"
            />
          </div>
        )}

        {isLoggedIn ? (
          <Link
            to="/mypage"
            aria-label="마이페이지"
            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold"
          >
            양
          </Link>
        ) : (
          <button
            type="button"
            onClick={login}
            className="bg-[#FFDD86] text-black text-sm font-semibold rounded-full px-5 py-2 hover:brightness-95 transition"
          >
            로그인
          </button>
        )}
      </div>
    </header>
  );
}