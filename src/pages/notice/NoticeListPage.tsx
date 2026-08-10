import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getNotices } from '../../api/noticeApi';
import type { Notice } from '../../types/notice';
import type { LayoutContext } from '../../components/layout/Layout';

export default function NoticeListPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useOutletContext<LayoutContext>();

  useEffect(() => {
    async function fetchNotices() {
      try {
        setIsLoading(true);
        // 💡 res를 any 타입으로 단언하여 'never' 에러를 방지합니다.
        const res: any = await getNotices();

        // 💡 백엔드 응답이 res 자체 배열인지, res.data 배열인지 둘 다 안전하게 검사
        const noticeList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        setNotices(noticeList);
        setError(null);
      } catch (err: any) {
        console.error('공지사항 로딩 실패:', err);
        setError('공지사항을 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotices();
  }, []);

  useEffect(() => {
    return () => setSearchQuery('');
  }, [setSearchQuery]);

  if (isLoading) return <p className="text-gray-500 py-10 text-center">불러오는 중...</p>;
  if (error) return <p className="text-red-500 py-10 text-center">{error}</p>;

  // 검색어 필터링
  const filteredNotices = notices.filter(
    (notice) =>
      notice?.title?.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">공지사항</h1>
      <p className="text-gray-400 mt-1">운영팀이 전달하는 소식을 확인하세요.</p>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {filteredNotices.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">
            {searchQuery ? '검색 결과가 없어요.' : '등록된 공지사항이 없어요.'}
          </p>
        ) : (
          filteredNotices.map((notice) => (
            <button
              key={notice.id}
              onClick={() => navigate(`/notice/${notice.id}`)}
              className="w-full text-left px-6 py-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{notice.title}</span>
                {notice.isNew && (
                  <span className="text-xs font-semibold bg-[#FFDD86] text-black px-2 py-0.5 rounded">
                    NEW
                  </span>
                )}
              </div>
              {/* 💡 notice.date가 없으면 (notice as any).createdAt에 접근하도록 안전하게 처리 */}
              <p className="text-sm text-gray-400 mt-1">
                {notice.date || (notice as any).createdAt}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}