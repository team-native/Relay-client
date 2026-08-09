import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getNoticeDetail } from '../../api/noticeApi';
import type { NoticeDetail } from '../../types/notice';
import { ChevronLeft } from 'lucide-react';

export default function NoticeDetailPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const navigate = useNavigate();

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeId) return;

    async function fetchDetail() {
      try {
        const data = await getNoticeDetail(noticeId!);
        setNotice(data);
      } catch {
        setError('공지사항을 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [noticeId]);

  if (isLoading) return <p className="text-gray-500">불러오는 중...</p>;
  if (error || !notice) return <p className="text-red-500">{error ?? '글을 찾을 수 없어요.'}</p>;

  return (
    <div>
        <button
        onClick={() => navigate('/notice')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
        공지사항 목록으로
        </button>

      <div className="mt-6">
        {notice.isNew && (
        <span className="inline-block text-xs font-semibold bg-[#FFDD86] text-black px-2 py-0.5 rounded mb-3">
            NEW
        </span>
        )}
        <h1 className="text-2xl font-bold">{notice.title}</h1>
        <p className="text-sm text-gray-400 mt-2">
          {notice.author} · {notice.date}
        </p>
      </div>

      <hr className="my-6 border-gray-200" />

      <p className="whitespace-pre-line leading-relaxed text-gray-800">
        {notice.content}
      </p>
    </div>
  );
}
