import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, User, Users } from 'lucide-react';
import { applyStudy, createStudyComment, getStudyDetail } from '../../api/studyApi';
import { getServerErrorMessage, LOGIN_REQUIRED_MESSAGE } from '../../api/errors';
import { useAuth } from '../../context/useAuth';
import { STATUS_BADGE_STYLES } from '../../constants/studyStatus';
import type { StudyComment, StudyDetail } from '../../types/study';
import type { LayoutContext } from '../../components/layout/Layout';

const VISIBLE_PARTICIPANTS = 4;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function Avatar({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span
      className={`shrink-0 rounded-full bg-[#FFDD86] text-black flex items-center justify-center font-semibold ${className}`}
    >
      {name.charAt(0)}
    </span>
  );
}

function parseScheduledAt(scheduledAt: string) {
  const match = scheduledAt.match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const [, month, day, hour, minute] = match.map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), month - 1, day, hour, minute);
}

function getApplicationDeadlineText(scheduledAt: string) {
  const deadline = parseScheduledAt(scheduledAt);
  if (!deadline) return '신청 마감일을 확인해주세요.';

  const now = new Date();
  const remainingDays = Math.ceil((deadline.getTime() - now.getTime()) / MS_PER_DAY);
  const formatted = `${deadline.getMonth() + 1}월 ${deadline.getDate()}일 ${String(
    deadline.getHours()
  ).padStart(2, '0')}:${String(deadline.getMinutes()).padStart(2, '0')}`;

  if (remainingDays <= 0) return `신청 마감: ${formatted} (마감됨)`;
  if (remainingDays === 1) return `신청 마감: ${formatted} (내일 마감)`;
  return `신청 마감: ${formatted} (${remainingDays}일 남음)`;
}

function isApplicationDeadlinePassed(scheduledAt: string) {
  const deadline = parseScheduledAt(scheduledAt);
  return deadline ? deadline.getTime() <= Date.now() : false;
}

function CommentItem({ comment }: { comment: StudyComment }) {
  return (
    <li className="flex gap-3">
      <Avatar name={comment.author} className="w-9 h-9 text-sm" />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{comment.author}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {comment.department} · {comment.cohort}
        </p>
        <p className="text-sm text-gray-800 mt-2 whitespace-pre-line break-words">
          {comment.content}
        </p>
        <p className="text-xs text-gray-300 mt-1.5">{comment.createdAt}</p>
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
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!studyId) return;

    async function fetchDetail() {
      try {
        const data = await getStudyDetail(studyId!);
        setStudy(data);
      } catch (err) {
        setError(getServerErrorMessage(err, '릴레이 스터디를 불러오지 못했어요.'));
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [studyId]);

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
      setStudy((prev) =>
        prev
          ? {
              ...prev,
              isApplied: true,
              participantCount: prev.participantCount + 1,
              participants: [
                {
                  id: `me-${Date.now()}`,
                  name: '양지우',
                  department: '스마트IoT과',
                  cohort: '10기',
                },
                ...prev.participants,
              ],
            }
          : prev
      );
    } catch (err) {
      setActionError(getServerErrorMessage(err, '참가 신청에 실패했어요. 다시 시도해주세요.'));
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
      const created = await createStudyComment(studyId, commentDraft.trim());
      setStudy((prev) =>
        prev
          ? {
              ...prev,
              comments: [created, ...prev.comments],
              commentCount: prev.commentCount + 1,
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
  const isFull = study.participantCount >= study.capacity;
  const hiddenParticipantCount = study.participantCount - VISIBLE_PARTICIPANTS;
  const deadlineText = getApplicationDeadlineText(study.scheduledAt);

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
            className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${STATUS_BADGE_STYLES[study.status]}`}
          >
            {study.status}
          </span>

          <h1 className="text-2xl font-bold mt-3">{study.title}</h1>

          <div className="flex items-center gap-3 mt-4">
            <Avatar name={study.author.name} className="w-10 h-10 text-base" />
            <div>
              <p className="font-semibold">{study.author.name}</p>
              <p className="text-sm text-gray-400">
                {study.author.department} · {study.author.cohort}
              </p>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <p className="whitespace-pre-line leading-relaxed text-gray-800">{study.description}</p>

          <hr className="my-6 border-gray-200" />

          <h2 className="text-sm font-semibold">참가자 {study.participantCount}명</h2>
          {study.participants.length === 0 ? (
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

          <h2 className="text-sm font-semibold">댓글 {study.commentCount}</h2>
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

          {study.comments.length === 0 ? (
            <p className="text-sm text-gray-400 mt-4">첫 댓글을 남겨보세요.</p>
          ) : (
            <ul className="mt-4 space-y-5">
              {study.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
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
              <dd className="font-medium text-right">{study.scheduledAt}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <User className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                연사자
              </dt>
              <dd className="font-medium text-right">{study.presenters.join(', ')}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-gray-500">
                <Users className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                인원
              </dt>
              <dd className="font-medium text-right">
                {study.participantCount} / {study.capacity}명
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
              {study.isApplied
                ? '연사 시작 전에 알려드릴게요.'
                : deadlineText}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
