import { useEffect, useState, useCallback } from 'react';
import { Link, useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, User, Users } from 'lucide-react';
import { applyStudy, createStudyComment, getStudyDetail, deleteStudy } from '../../api/studyApi';
import { getServerErrorMessage, LOGIN_REQUIRED_MESSAGE } from '../../api/errors';
import { useAuth } from '../../context/useAuth';
import { STATUS_BADGE_STYLES } from '../../constants/studyStatus';
import type { StudyDetail, StudyStatus } from '../../types/study';
import type { LayoutContext } from '../../components/layout/Layout';

const VISIBLE_PARTICIPANTS = 4;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const SERVER_TO_UI_STATUS: Record<string, StudyStatus> = {
  PENDING: '개설미정',
  CONFIRMED: '개설확정',
  FINISHED: '종료',
};

// 🛠️ 학과 영문 코드를 한글 명칭으로 변환 매핑
const DEPARTMENT_LABEL_MAP: Record<string, string> = {
  SW_DEVELOPMENT: '소프트웨어개발과',
  SMART_IOT: '스마트IoT과',
  AI: 'AI과',
};

function getDepartmentLabel(code: string | undefined | null): string {
  if (!code) return '';
  return DEPARTMENT_LABEL_MAP[code] || code;
}

// 🛠️ JWT 토큰에서 Role 파싱
function getRoleFromToken(): string | null {
  try {
    const token =
      localStorage.getItem('relay_access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('JWT') ||
      localStorage.getItem('auth');

    if (!token) return null;

    const cleanToken = token.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
    const base64Url = cleanToken.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(jsonPayload);
    return parsed?.role || parsed?.auth || parsed?.roles?.[0] || parsed?.userRole || null;
  } catch (e) {
    return null;
  }
}

// 🛠️ JWT 토큰 또는 LocalStorage에서 로그인한 실제 사용자 이름 파싱
function getNameFromToken(): string {
  try {
    const localUserRaw = localStorage.getItem('user');
    if (localUserRaw) {
      const parsedUser = JSON.parse(localUserRaw);
      const name = parsedUser?.name || parsedUser?.userName || parsedUser?.nickname;
      if (name && name !== '양지우') return name;
    }

    const token =
      localStorage.getItem('relay_access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('JWT') ||
      localStorage.getItem('auth');

    if (!token) return '참가자';

    const cleanToken = token.replace(/^"(.*)"$/, '$1').replace(/^Bearer\s+/i, '');
    const base64Url = cleanToken.split('.')[1];
    if (!base64Url) return '참가자';

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const parsed = JSON.parse(jsonPayload);
    return parsed?.name || parsed?.userName || parsed?.nickname || parsed?.sub || '참가자';
  } catch (e) {
    return '참가자';
  }
}

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
    comment.authorName ||
    comment.author?.name ||
    comment.userName ||
    comment.user?.name ||
    comment.name ||
    '익명';

  const rawDept =
    comment.authorDepartment || comment.author?.department || comment.department || '';
  const department = getDepartmentLabel(rawDept);

  const gen = comment.generation || comment.authorGeneration || comment.cohort;
  const cohort = gen ? (String(gen).endsWith('기') ? String(gen) : `${gen}기`) : '';

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
  const navigate = useNavigate();

  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { showToast } = useOutletContext<LayoutContext>();

  const auth = useAuth() as Record<string, any>;
  const isLoggedIn = Boolean(
    auth?.isLoggedIn ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('relay_access_token')
  );

  const user = auth?.user || auth?.userInfo || auth;
  const tokenRole = getRoleFromToken();

  let localUserRole = '';
  try {
    const localUserRaw = localStorage.getItem('user');
    if (localUserRaw) {
      const parsed = JSON.parse(localUserRaw);
      localUserRole = parsed?.role || parsed?.userRole || '';
    }
  } catch (e) {
    // ignore
  }

  const role =
    user?.role ||
    user?.userRole ||
    auth?.role ||
    localStorage.getItem('role') ||
    localStorage.getItem('userRole') ||
    localUserRole ||
    tokenRole ||
    '';

  const isAdmin = String(role).toUpperCase().includes('ADMIN');

  // 🛠️ 상세정보 불러오는 핵심 함수 (myPage 500 에러 대응 완벽 적용)
  const fetchDetailAndComments = useCallback(async () => {
    if (!studyId) return;

    try {
      const rawToken =
        localStorage.getItem('relay_access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('JWT') ||
        localStorage.getItem('auth');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (rawToken) {
        const cleanToken = rawToken.replace(/^"(.*)"$/, '$1');
        headers['Authorization'] = cleanToken.startsWith('Bearer ')
          ? cleanToken
          : `Bearer ${cleanToken}`;
      }

      const detailRes = await getStudyDetail(studyId);
      const rawData = (detailRes as any)?.data || detailRes || {};

      let commentsData: any[] = rawData.comments || rawData.commentList || [];

      if (!commentsData.length) {
        try {
          let res = await fetch(`https://relayplus.kr:34308/api/lectures/${studyId}/comments`, {
            method: 'GET',
            headers,
          });

          if (!res.ok) {
            res = await fetch(`https://relayplus.kr:34308/api/lectures/lecture/${studyId}/comments`, {
              method: 'GET',
              headers,
            });
          }

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

      let isUserApplied = Boolean(
        rawData.isApplied ??
          rawData.applied ??
          rawData.isEnrolled ??
          rawData.enrolled ??
          false
      );

      // myPage 500 에러가 터져도 전체 프로세스가 안 깨지도록 try-catch 보완
      if (rawToken) {
        try {
          const myPageRes = await fetch('https://relayplus.kr:34308/api/myPage', {
            method: 'GET',
            headers,
          });

          if (myPageRes.ok) {
            const myData = await myPageRes.json();
            const enrolledLectures = myData.enrolledLectures || myData.enrollments || [];
            if (Array.isArray(enrolledLectures)) {
              const isFound = enrolledLectures.some(
                (lecture: any) => String(lecture.id || lecture.lectureId) === String(studyId)
              );
              if (isFound) isUserApplied = true;
            }
          }
        } catch (e) {
          console.error('마이페이지 정보 로딩 중 오류 발생:', e);
        }
      }

      const singlePresenter = rawData.presenter;
      const rawParticipants =
        rawData.participants ||
        rawData.enrollments ||
        rawData.appliedUsers ||
        rawData.applicants ||
        [];

      let mappedParticipants = Array.isArray(rawParticipants)
        ? rawParticipants.map((p: any, idx: number) => {
            const pUser = p.user || p.userInfo || p.member || p;
            const nameCandidate =
              pUser.name ||
              pUser.userName ||
              pUser.authorName ||
              pUser.nickname ||
              p.name ||
              p.userName ||
              p.authorName;

            const actualName =
              nameCandidate && nameCandidate !== '양지우'
                ? nameCandidate
                : getNameFromToken();

            const gen = pUser.generation || pUser.authorGeneration || pUser.cohort || p.generation;
            return {
              id: pUser.id || pUser.userId || p.id || `p-${idx}`,
              name: actualName,
              department: pUser.department || pUser.authorDepartment || p.department || '',
              cohort: gen ? (String(gen).endsWith('기') ? String(gen) : `${gen}기`) : '',
            };
          })
        : [];

      // 중복 제거
      const uniqueParticipants = mappedParticipants.filter(
        (p, index, self) =>
          index === self.findIndex((t) => (t.id && t.id === p.id) || t.name === p.name)
      );

      setStudy((prevStudy) => {
        // 이미 신청한 적이 있다면 500 에러 응답 때문에 취소 처리되지 않도록 방어
        const finalIsApplied = prevStudy?.isApplied ? true : isUserApplied;

        let finalParticipants = uniqueParticipants;
        // 신청 완료된 상태인데 백엔드가 참가자를 안 보내준 경우 내 정보 유지
        if (finalIsApplied && finalParticipants.length === 0) {
          const currentUserName = user?.name || user?.userName || getNameFromToken();
          finalParticipants = [
            {
              id: 'my-temp-id',
              name: currentUserName,
              department: user?.department || '',
              cohort: user?.generation ? `${user.generation}기` : '',
            },
          ];
        }

        const actualParticipantCount =
          rawData.applicantCount ??
          rawData.enrollmentCount ??
          rawData.participantCount ??
          rawData.currentParticipants ??
          finalParticipants.length;

        return {
          id: rawData.id ?? studyId,
          title: rawData.title || '제목 없음',
          description: rawData.description || '내용이 없습니다.',
          status: SERVER_TO_UI_STATUS[rawData.status] || rawData.status || '개설미정',
          scheduledAt: rawData.scheduledAt,
          createdAt: rawData.createdAt,
          isApplied: finalIsApplied,
          capacity: rawData.capacity ?? rawData.maxParticipants ?? 0,
          participantCount: actualParticipantCount,
          commentCount: rawData.commentCount ?? commentsData.length ?? 0,
          author: rawData.author || {
            name: singlePresenter || '익명',
            department: '',
            cohort: '',
          },
          participants: finalParticipants,
          comments: commentsData,
          presenters:
            rawData.presenters && rawData.presenters.length > 0
              ? rawData.presenters
              : singlePresenter
                ? [singlePresenter]
                : ['연사 정보 없음'],
        };
      });
    } catch (err) {
      setError(getServerErrorMessage(err, '릴레이 스터디를 불러오지 못했어요.'));
    } finally {
      setIsLoading(false);
    }
  }, [studyId, user]);

  useEffect(() => {
    fetchDetailAndComments();
  }, [fetchDetailAndComments]);

  async function handleDeleteStudy() {
    if (!studyId || !window.confirm('정말 이 강의를 삭제하시겠습니까?')) return;
    try {
      await deleteStudy(studyId);
      alert('강의가 삭제되었습니다.');
      navigate('/');
    } catch (err) {
      alert(getServerErrorMessage(err, '강의 삭제에 실패했습니다.'));
    }
  }

  // 🛠️ 참가 신청 핸들러
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
      showToast('참가 신청이 완료되었습니다.');

      const currentUserName = user?.name || user?.userName || getNameFromToken();
      const currentUserDept = user?.department || '';
      const currentUserGen = user?.generation || user?.cohort || '';

      // UI 먼저 업데이트 (클라이언트 화면에 먼저 찍어줌)
      setStudy((prev) => {
        if (!prev) return prev;
        const exists = prev.participants?.some((p) => p.name === currentUserName);
        const updatedParticipants = exists
          ? prev.participants
          : [
              ...(prev.participants || []),
              {
                id: `my-apply-${Date.now()}`,
                name: currentUserName,
                department: currentUserDept,
                cohort: currentUserGen
                  ? String(currentUserGen).endsWith('기')
                    ? String(currentUserGen)
                    : `${currentUserGen}기`
                  : '',
              },
            ];

        return {
          ...prev,
          isApplied: true,
          participantCount: (prev.participantCount || 0) + (exists ? 0 : 1),
          participants: updatedParticipants,
        };
      });

      // 백엔드 재조회 실행
      await fetchDetailAndComments();
    } catch (err: any) {
      const errorMsg = getServerErrorMessage(err, '참가 신청에 실패했어요. 다시 시도해주세요.');

      if (errorMsg.includes('이미 신청') || err?.response?.status === 409) {
        await fetchDetailAndComments();
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
  const isFull = participantCount >= capacity && capacity > 0;
  const hiddenParticipantCount = participantCount - VISIBLE_PARTICIPANTS;
  const deadlineText = getApplicationDeadlineText(study.scheduledAt);

  const presentersText = Array.isArray(study.presenters)
    ? study.presenters.join(', ')
    : '연사 정보 없음';

  const isAuthorOrAdmin = isAdmin;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
        >
          <ChevronLeft className="w-4 h-4" strokeWidth={1.8} />
          홈으로
        </Link>

        {isAuthorOrAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/lecture/${studyId}/edit`)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              수정
            </button>
            <button
              onClick={handleDeleteStudy}
              className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
            >
              삭제
            </button>
          </div>
        )}
      </div>

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
                  {[getDepartmentLabel(study.author?.department), study.author?.cohort]
                    .filter(Boolean)
                    .join(' · ')}
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
              {study.participants.slice(0, VISIBLE_PARTICIPANTS).map((participant, idx) => (
                <div
                  key={participant.id || idx}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2"
                >
                  <Avatar name={participant.name} className="w-8 h-8 text-xs" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{participant.name}</p>
                    {(participant.department || participant.cohort) && (
                      <p className="text-xs text-gray-400 truncate">
                        {[getDepartmentLabel(participant.department), participant.cohort]
                          .filter(Boolean)
                          .join(' · ')}
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