import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createNotice, updateNotice, getNoticeDetail } from '../../api/noticeApi';
import { useAuth } from '../../context/useAuth';

// JWT 토큰 디코딩 함수
function getRoleFromToken(): string | null {
  try {
    const token =
      localStorage.getItem('relay_access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken');
    if (!token) return null;

    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(jsonPayload);
    return parsed?.role || parsed?.auth || parsed?.roles?.[0] || null;
  } catch (e) {
    return null;
  }
}

export default function NoticeFormPage() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const isEditMode = Boolean(noticeId);
  const navigate = useNavigate();

  const auth = useAuth() as Record<string, any>;
  const user = auth?.user || auth?.userInfo || auth;
  const tokenRole = getRoleFromToken();
  
  // 어드민 검사 (JWT, AuthContext, LocalStorage 종합 판단)
  const role = user?.role || auth?.role || localStorage.getItem('role') || tokenRole;
  const isAdmin = role === 'ADMIN';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 수정 모드일 때 기존 데이터 불러오기
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
        setIsDataLoading(false);
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
      setError(
        isEditMode
          ? '수정에 실패했어요. 다시 시도해주세요.'
          : '등록에 실패했어요. 다시 시도해주세요.'
      );
      setIsSubmitting(false);
    }
  }

  // 만약 권한이 없는 경우 안내 문구 표시
  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 font-medium">관리자만 접근할 수 있는 페이지입니다.</p>
        <button
          onClick={() => navigate('/notice')}
          className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
        >
          공지사항 목록으로
        </button>
      </div>
    );
  }

  if (isDataLoading) return <p className="text-gray-500 py-10 text-center">불러오는 중...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {isEditMode ? '공지사항 수정' : '공지사항 작성'}
      </h1>

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