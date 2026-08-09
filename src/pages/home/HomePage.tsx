import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Calendar, MessageSquare, SquarePen, User, Users } from 'lucide-react';
import { getStudies } from '../../api/studyApi';
import { getServerErrorMessage, LOGIN_REQUIRED_MESSAGE } from '../../api/errors';
import { useAuth } from '../../context/useAuth';
import { STATUS_BADGE_STYLES, STUDY_STATUSES } from '../../constants/studyStatus';
import type { Study, StudyStatus } from '../../types/study';
import type { LayoutContext } from '../../components/layout/Layout';

const STUDIES_PER_PAGE = 6;

function StudyCard({ study }: { study: Study }) {
  return (
    <Link
      to={`/lecture/${study.id}`}
      className="block bg-white border border-gray-200 rounded-xl px-6 pt-6 pb-5 hover:border-[#FFDD86] transition-colors"
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${STATUS_BADGE_STYLES[study.status]}`}
        >
          {study.status}
        </span>
        <span className="text-xs text-gray-400">{study.createdAt} 등록</span>
      </div>

      <h3 className="font-bold text-lg mt-5">{study.title}</h3>

      <div className="mt-5 space-y-3 text-sm text-gray-500">
        <p className="flex items-center gap-2">
          <User className="w-4 h-4 shrink-0" strokeWidth={1.8} />
          {study.presenters.join(', ')}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.8} />
          {study.scheduledAt}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 mt-8 pt-4 text-sm text-gray-400">
        <span className="flex items-center gap-1.5">
          <Users className="w-4 h-4 shrink-0" strokeWidth={1.8} />
          {study.participantCount}/{study.capacity}명
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 shrink-0" strokeWidth={1.8} />
          {study.commentCount}
        </span>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [activeStatus, setActiveStatus] = useState<StudyStatus>('개설미정');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { searchQuery, setSearchQuery, showToast } = useOutletContext<LayoutContext>();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    async function fetchStudies() {
      try {
        const data = await getStudies();
        setStudies(data);
      } catch (err) {
        setError(getServerErrorMessage(err, '릴레이 스터디를 불러오지 못했어요.'));
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudies();
  }, []);

  // 로그인하지 않았으면 등록 페이지로 넘기지 않고 안내만 띄워요.
  function handleCreateClick(e: React.MouseEvent) {
    if (isLoggedIn) return;

    e.preventDefault();
    showToast(LOGIN_REQUIRED_MESSAGE);
  }

  useEffect(() => {
    return () => setSearchQuery('');
  }, [setSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus, searchQuery]);

  const keyword = searchQuery.trim().toLowerCase();
  const visibleStudies = studies.filter(
    (study) =>
      study.status === activeStatus && study.title.toLowerCase().includes(keyword)
  );
  const totalPages = Math.ceil(visibleStudies.length / STUDIES_PER_PAGE);
  const pagedStudies = visibleStudies.slice(
    (currentPage - 1) * STUDIES_PER_PAGE,
    currentPage * STUDIES_PER_PAGE
  );

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">이번 주 릴레이 스터디</h1>
          <p className="text-gray-400 mt-1">
            자유롭게 주제를 선정해, 컨퍼런스 형식으로 발표해보세요.
          </p>
        </div>

        {activeStatus === '개설미정' && (
          <Link
            to="/new"
            onClick={handleCreateClick}
            className="flex items-center gap-2 shrink-0 bg-[#FFDD86] text-black text-sm font-medium rounded-full px-5 py-2.5 hover:brightness-95 transition"
          >
            <SquarePen className="w-4 h-4" strokeWidth={1.8} />새 게시물
          </Link>
        )}
      </div>

      <div className="flex items-center gap-7 border-b border-gray-200 mt-12">
        {STUDY_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setActiveStatus(status)}
            className={`relative pb-3 text-sm ${
              status === activeStatus ? 'text-[#FFDD86] font-semibold' : 'text-gray-700'
            }`}
          >
            {status}
            {status === activeStatus && (
              <span className="absolute left-0 right-0 -bottom-[1px] h-[3px] rounded-full bg-[#FFDD86]" />
            )}
          </button>
        ))}
      </div>

      {error ? (
        <p className="text-red-500 mt-6">{error}</p>
      ) : !isLoading && visibleStudies.length === 0 ? (
        <p className="mt-10 text-center text-sm text-gray-400">
          {keyword ? '검색 결과가 없어요.' : '아직 등록된 스터디가 없어요.'}
        </p>
      ) : null}

      {pagedStudies.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-5 mt-6">
            {pagedStudies.map((study) => (
              <StudyCard key={study.id} study={study} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-7">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
                className="w-8 h-8 text-sm text-gray-500 disabled:text-gray-300"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-sm font-medium ${
                    page === currentPage
                      ? 'bg-[#FFDD86] text-black'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
                className="w-8 h-8 text-sm text-gray-500 disabled:text-gray-300"
              >
                &gt;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
