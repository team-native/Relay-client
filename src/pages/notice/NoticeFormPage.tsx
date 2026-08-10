import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNotice, updateNotice, getNoticeDetail } from '../../api/noticeApi';
import { useAuth } from '../../context/useAuth';

export default function NoticeFormPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const isEditMode = Boolean(noticeId);
  const navigate = useNavigate();

  const auth = useAuth() as Record<string, any>;
  const user = auth?.user || auth?.userInfo || auth;
  const isAdmin = user?.role === 'ADMIN';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 관리자가 아니면 접근 차단 (버튼 숨김과 별개로 라우트 자체도 보호)
  useEffect(() => {
    if (!isAdmin) navigate('/notice');
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!isEditMode || !noticeId) return;

    async function fetchDetail() {
      try {
        const data = await getNoticeDetail(noticeId!);
        setTitle(data.title || '');
        setContent(data.content || '');
      } catch {
        setError('공지사항을 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [isEditMode, noticeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (isEditMode && noticeId) {
        await updateNotice(noticeId, { title: title.trim(), content: content.trim() });
        navigate(`/notice/${noticeId}`);
      } else {
        const created: any = await createNotice({ title: title.trim(), content: content.trim() });
        const newId = created?.id ?? created?.data?.id;
        navigate(newId ? `/notice/${newId}` : '/notice');
      }
    } catch {
      setError(isEditMode ? '수정에 실패했어요. 다시 시도해주세요.' : '등록에 실패했어요. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  }

  if (!isAdmin) return null;
  if (isLoading) return <p className="text-gray-500">불러오는 중...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{isEditMode ? '공지사항 수정' : '공지사항 작성'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요."
            className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력해주세요."
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 resize-none"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-11 px-5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-40"
          >
            {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}