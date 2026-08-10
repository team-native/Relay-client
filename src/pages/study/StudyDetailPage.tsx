import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, User, Users } from 'lucide-react';
import { applyStudy, createStudyComment, getStudyDetail } from '../../api/studyApi';
import { getServerErrorMessage, LOGIN_REQUIRED_MESSAGE } from '../../api/errors';
import { useAuth } from '../../context/useAuth';
import { STATUS_BADGE_STYLES } from '../../constants/studyStatus';
import type { StudyDetail, StudyStatus } from '../../types/study';
import type { LayoutContext } from '../../components/layout/Layout';

const VISIBLE_PARTICIPANTS = 4;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const CONFIRMED_PARTICIPANT_COUNT = 10;

const SERVER_TO_UI_STATUS: Record<string, StudyStatus> = {
  PENDING: '개설미정',
  CONFIRMED: '개설확정',
  FINISHED: '종료',
};

function Avatar({ name = '', className = '' }: { name?: string; className?: string }) {
  const safeName = name || '익명';
  return (
    <span
      className={`shrink-0 rounded-full bg-[#FFDD86] text-black flex items-center justify-center font-semibold ${className}`}
    >
      {safeName.charAt(0)}
    </span>
  );
}

function parseScheduledAt(scheduledAt?: string): Date | null {
  if (!scheduledAt || typeof scheduledAt !== 'string') return null;

  const match = scheduledAt.match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})$/);
  if (match) {
    const [, month, day, hour, minute] = match.map(Number);
    const now = new Date();
    return new Date(now.getFullYear(), month - 1, day, hour, minute);
  }

  const parsedDate = new Date(scheduledAt);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate;
  }

  return null;
}

function getApplicationDeadlineText(scheduledAt?: string) {
  const deadline = parseScheduledAt(scheduledAt);
  if (!deadline) return '일정을 확인해주세요.';

  const now = new Date();
  const remainingDays = Math.ceil((deadline.getTime() - now.getTime()) / MS_PER_DAY);
  const formatted = `${deadline.getMonth() + 1}월 ${deadline.getDate()}일 ${String(
    deadline.getHours()
  ).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}`;

  if (remainingDays <= 0) return `신청 마감: ${formatted}`;
  if (remainingDays === 1) return `신청 마감: ${formatted} (내일 마감)`;
  return `신청 마감: ${formatted} (${remainingDays}일 남음)`;
}

function isApplicationDeadlinePassed(scheduledAt?: string) {
  const deadline = parseScheduledAt(scheduledAt);
  return deadline ? deadline.getTime() <= Date.now() : false;
}

function CommentItem({ comment }: { comment: any }) {
  const authorName =
    comment.authorName || comment.author?.name || comment.userName || comment.user?.name || '익명';
  const department =
    comment.authorDepartment || comment.author?.department || comment.department || '';
  const cohort = comment.authorGeneration
    ? `${comment.authorGeneration}기`
    : comment.author?.cohort
      ? `${comment.author.cohort}`
      : comment.cohort
        ? `${comment.cohort}`
        : '';
  const createdAt = comment.timeAgo || comment.createdAt || '';

  return (
    <li className="flex gap-3">
      <Avatar name={authorName} className="w-9 h-9 text-sm" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{authorName}</p>
        {(department || cohort) && (
          <p className="text-xs text-gray-400 mt-0.5">
            {[department, cohort].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-sm text-gray-800 mt-2 whitespace-pre-line break-words">
          {comment.content}
        </p>
        {createdAt && <p className="text-xs text-gray-300 mt-1.5">{createdAt}</p>}
      </div>
    </li>
  );
}

export default function StudyDetailPage() {
  const { studyId } = useParams<{ studyId: string }>();

  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { showToast } = useOutletContext<LayoutContext>();
  
  // TypeScript AuthContextValue 에러 우회 처리
  const auth = useAuth() as Record<string, any>;
  const isLoggedIn = Boolean(auth?.isLoggedIn);
  const user = auth?.user || auth?.userInfo || auth?.profile || null;

  useEffect(() => {
    if (!studyId) return;

    async function fetchDetailAndComments() {
      try {
        const detailRes = await getStudyDetail(studyId!);
        const rawData = (detailRes as any)?.data || detailRes || {};

        // 1. 댓글 데이터 방어적 파싱
        let commentsData: any[] = rawData.comments || rawData.commentList || [];

        if (!commentsData.length) {
          try {
            const token =
              localStorage.getItem('token') ||
              localStorage.getItem('accessToken') ||
              localStorage.getItem('JWT') ||
              localStorage.getItem('auth');

            const headers: Record<string, string> = {
              'Content-Type': 'application/json',
            };

            if (token) {
              const cleanToken = token.replace(/^"(.*)"$/, '$1');
              headers['Authorization'] = cleanToken.startsWith('Bearer ')
                ? cleanToken
                : `Bearer ${cleanToken}`;
            }

            const res = await fetch(`https://relayplus.kr:34308/api/comments?lectureId=${studyId}`, {
              method: 'GET',
              headers,
            });

            if (res.ok) {
              const resJson = await res.json();
              commentsData = Array.isArray(resJson)
                ? resJson
                : resJson.data || resJson.comments || [];
            }
          } catch (e) {
            console.error('댓글 API 요청 실패:', e);
          }
        }

        const singlePresenter = rawData.presenter;

        // 참가자 목록 파싱
        const rawParticipants =
          rawData.participants ||
          rawData.enrollments ||
          rawData.appliedUsers ||
          rawData.applicants ||
          [];
        const mappedParticipants = Array.isArray(rawParticipants)
          ? rawParticipants.map((p: any, idx: number) => ({
              id: p.id || p.userId || `p-${idx}`,
              name: p.name || p.userName || p.authorName || '참가자',
              department: p.department || p.authorDepartment || '',
              cohort: p.cohort || (p.authorGeneration ? `${p.authorGeneration}기` : ''),
            }))
          : [];

        // 신청 여부(isApplied) 감지
        let isUserApplied = Boolean(
          rawData.isApplied ??
            rawData.applied ??
            rawData.isEnrolled ??
            rawData.enrolled ??
            rawData.isAppliedUser ??
            false
        );

        // 만약 서버에서 boolean을 안 줬다면, 참가자 목록에서 현재 접속 유저 찾기
        if (!isUserApplied && user && mappedParticipants.length > 0) {
          isUserApplied = mappedParticipants.some(
            (p) => String(p.id) === String(user.id) || p.name === user.name
          );
        }

        // 인원수 감지
        const actualParticipantCount =
          rawData.applicantCount ??
          rawData.enrollmentCount ??
          rawData.participantCount ??
          rawData.currentParticipants ??
          rawData.appliedCount ??
          mappedParticipants.length ??
          0;

        const formattedData: StudyDetail = {
          id: rawData.id ?? studyId,
          title: rawData.title || '제목 없음',
          description: rawData.description || '내용이 없습니다.',
          status: SERVER_TO_UI_STATUS[rawData.status] || rawData.status || '개설미정',
          scheduledAt: rawData.scheduledAt,
          createdAt: rawData.createdAt,

          isApplied: isUserApplied,

          capacity: rawData.capacity ?? rawData.maxParticipants ?? 0,
          participantCount: actualParticipantCount,
          commentCount: rawData.commentCount ?? commentsData.length ?? 0,

          author: rawData.author || {
            name: singlePresenter || '익명',
            department: '',
            cohort: '',
          },
          participants: mappedParticipants,
          comments: commentsData,

          presenters:
            rawData.presenters && rawData.presenters.length > 0
              ? rawData.presenters
              : singlePresenter
                ? [singlePresenter]
                : ['연사 정보 없음'],
        };

        setStudy(formattedData);
      } catch (err) {
        setError(getServerErrorMessage(err, '릴레이 스터디를 불러오지 못했어요.'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetailAndComments();
  }, [studyId, user]);

  async function handleApply() {
    if (!studyId || !study) return;
    if (!isLoggedIn) {
      showToast(LOGIN_REQUIRED_MESSAGE);
      return;
    }

    setIsApplying(true);
    setActionError(null);
    try {
      await applyStudy(studyId);
      setStudy((prev) => {
        if (!prev) return prev;

        const nextParticipantCount = (prev.participantCount || 0) + 1;

        return {
          ...prev,
          status:
            nextParticipantCount >= CONFIRMED_PARTICIPANT_COUNT && prev.status === '개설미정'
              ? '개설확정'
              : prev.status,
          isApplied: true,
          participantCount: nextParticipantCount,
        };
      });
    } catch (err: any) {
      const errorMsg = getServerErrorMessage(err, '참가 신청에 실패했어요. 다시 시도해주세요.');
      
      // 이미 신청한 강의(409) 에러 발생 시 프론트 상태를 '신청 완료'로 자동 변경
      if (errorMsg.includes('이미 신청') || err?.response?.status === 409) {
        setStudy((prev) => (prev ? { ...prev, isApplied: true } : prev));
        setActionError(null);
      } else {
        setActionError(errorMsg);
      }
    } finally {
      setIsApplying(false);
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studyId || !commentDraft.trim()) return;
    if (!isLoggedIn) {
      showToast(LOGIN_REQUIRED_MESSAGE);
      return;
    }

    setIsPostingComment(true);
    setActionError(null);
    try {
      const response = await createStudyComment(studyId, commentDraft.trim());

      const responseObj = response as any;
      const created = responseObj?.data || responseObj;

      setStudy((prev) =>
        prev
          ? {
              ...prev,
              comments: [created, ...(prev.comments || [])],
              commentCount: (prev.commentCount || 0) + 1,
            }
          : prev
      );
      setCommentDraft('');
    } catch (err) {
      setActionError(getServerErrorMessage(err, '댓글 등록에 실패했어요. 다시 시도해주세요.'));
    } finally {
      setIsPostingComment(false);
    }
  }

  if (isLoading) return <p className="text-gray-500">불러오는 중...</p>;
  if (error || !study) {
    return <p className="text-red-500">{error ?? '릴레이 스터디를 찾을 수 없어요.'}</p>;
  }

  const isClosed = study.status === '종료';
  const isDeadlinePassed = isApplicationDeadlinePassed(study.scheduledAt);
  const participantCount = study.participantCount ?? 0;
  const capacity = study.capacity ?? 0;
  const isFull = participantCount >= capacity;
  const hiddenParticipantCount = participantCount - VISIBLE_PARTICIPANTS;
  const deadlineText = getApplicationDeadlineText(study.scheduledAt);

  const presentersText = Array.isArray(study.presenters)
    ? study.presenters.join(', ')
    : '연사 정보 없음';

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
        홈으로
      </Link>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start mt-5">
        <div>
          <span
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
              STATUS_BADGE_STYLES[study.status as StudyStatus] || 'bg-gray-100 text-gray-600'
            }`}
          >
            {study.status}
          </span>

          <h1 className="text-2xl font-bold mt-3">{study.title}</h1>

          <div className="flex items-center gap-3 mt-4">
            <Avatar name={study.author?.name} className="w-10 h-10 text-base" />
            <div>
              <p className="font-semibold">{study.author?.name || '익명'}</p>
              {(study.author?.department || study.author?.cohort) && (
                <p className="text-sm text-gray-400">
                  {[study.author?.department, study.author?.cohort].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <p className="whitespace-pre-line leading-relaxed text-gray-800">{study.description}</p>

          <hr className="my-6 border-gray-200" />

          <h2 className="text-sm font-semibold">참가자 {participantCount}명</h2>
          {!study.participants || study.participants.length === 0 ? (
            <p className="text-sm text-gray-400 mt-3">아직 참가자가 없어요.</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {study.participants.slice(0, VISIBLE_PARTICIPANTS).map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
                >
                  <Avatar name={participant.name} className="w-8 h-8 text-xs" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{participant.name}</p>
                    {(participant.department || participant.cohort) && (
                      <p className="text-xs text-gray-400 truncate">
                        {[participant.department, participant.cohort].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {hiddenParticipantCount > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 text-sm text-gray-400">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold flex items-center justify-center">
                    +{hiddenParticipantCount}
                  </span>
                  더 많은 참가자가 있어요
                </div>
              )}
            </div>
          )}

          <hr className="my-6 border-gray-200" />

          <h2 className="text-sm font-semibold">댓글 {study.comments?.length ?? 0}</h2>
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 mt-4">
            <input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              placeholder="댓글을 남겨보세요."
              className="flex-1 h-11 border border-gray-200 rounded-lg px-4 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={isPostingComment || !commentDraft.trim()}
              className="shrink-0 h-11 px-5 rounded-lg bg-gray-900 text-white text-sm font-medium disabled:opacity-40"
            >
              {isPostingComment ? '등록 중...' : '등록'}
            </button>
          </form>

          {!study.comments || study.comments.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4">첫 댓글을 남겨보세요.</p>
          ) : (
            <ul className="mt-4 space-y-5">
              {study.comments.map((comment, index) => (
                <CommentItem key={comment.id || index} comment={comment} />
              ))}
            </ul>
          )}

          {actionError && <p className="text-red-500 text-sm mt-3">{actionError}</p>}
        </div>

        <aside className="sticky top-6 bg-white border border-gray-200 rounded-xl px-5 py-5">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                일시
              </dt>
              <dd className="font-medium text-right">
                {study.scheduledAt ? String(study.scheduledAt).replace('T', ' ') : '미정'}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <User className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                연사자
              </dt>
              <dd className="font-medium text-right">{presentersText}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <Users className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                인원
              </dt>
              <dd className="font-medium text-right">
                {participantCount} / {capacity}명
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handleApply}
            disabled={isClosed || isDeadlinePassed || isFull || study.isApplied || isApplying}
            className="w-full mt-5 h-12 rounded-lg bg-[#FFDD86] text-black font-semibold hover:brightness-95 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:brightness-100"
          >
            {isClosed
              ? '종료된 스터디예요'
              : isDeadlinePassed
                ? '신청이 마감됐어요'
              : study.isApplied
                ? '신청 완료'
                : isFull
                  ? '모집이 마감됐어요'
                  : isApplying
                    ? '신청 중...'
                    : '참가 신청하기'}
          </button>

          {!isClosed && (
            <p className="text-xs text-gray-400 text-center mt-3">
              {study.isApplied ? '연사 시작 전에 알려드릴게요.' : deadlineText}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}