import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Lock, LogOut, Calendar } from 'lucide-react';
import { getMyProfile, getEnrolledCourses } from '../../api/userApi';
import type { UserProfile, EnrolledCourse } from '../../types/user';

const STATUS_STYLES: Record<EnrolledCourse['status'], string> = {
  개설미정: 'bg-white text-black border border-[#D9D9D9]',
  개설확정: 'bg-[#FFDD86] text-black border border-[#D9D9D9]',
  종료: 'bg-[#D9D9D9] text-black border border-[#BCBCBC]',
};

const SETTINGS_ITEMS = [
  { icon: Pencil, label: '프로필 수정', path: '/mypage/profile' },
  { icon: Lock, label: '비밀번호 변경', path: '/mypage/password' },
] as const;

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const [profileData, coursesData] = await Promise.all([
          getMyProfile(),
          getEnrolledCourses(),
        ]);
        setProfile(profileData);
        setCourses(coursesData);
      } catch (err) {
        setError('내 정보를 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAll();
  }, []);

  function handleLogout() {
    console.log('logout clicked');
  }

  if (isLoading) return <p className="text-gray-500">불러오는 중...</p>;
  if (error || !profile) return <p className="text-red-500">{error ?? '정보를 찾을 수 없어요.'}</p>;

  return (
    <div>
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-xl font-semibold">
            {profile.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-lg">{profile.name}</p>
            <p className="text-sm text-gray-400">
              {profile.department} · {profile.cohort}
            </p>
          </div>
        </div>
        <Link to="/mypage/profile" aria-label="프로필 수정">
          <Pencil className="w-5 h-5 text-gray-400" strokeWidth={1.8} />
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mt-8 mb-3">내가 들은 강의</h2>
      <div className="grid grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLES[course.status]}`}>
              {course.status}
            </span>
            <p className="font-semibold mt-2">{course.title}</p>
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2">
            <Calendar className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
            {course.scheduledAt}
            </div>
        </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-gray-700 mt-8 mb-3">설정</h2>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {SETTINGS_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3 text-gray-500">
              <item.icon className="w-4 h-4" strokeWidth={1.8} />
              <span className="text-sm text-gray-900">{item.label}</span>
            </div>
            <span className="text-gray-300">›</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 text-left text-gray-500"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.8} />
          <span className="text-sm text-gray-900">로그아웃</span>
        </button>
      </div>
    </div>
  );
}