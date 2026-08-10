import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, updateMyProfile } from '../../api/userApi';
import { ACCESS_TOKEN_KEY } from '../../api/client';
import {
  DEPARTMENT_OPTIONS,
  COHORT_OPTIONS,
  DEPARTMENT_LABEL_MAP,
  DEPARTMENT_API_VALUES,
} from '../../constants/profileOptions';
import CustomSelect from '../../components/ui/CustomSelect';

interface ProfileFormState {
  name: string;
  email: string;
  department: string;
  cohort: string;
}

const EMPTY_FORM: ProfileFormState = {
  name: '',
  email: '',
  department: '',
  cohort: '',
};

const formatCohortToLabel = (cohort: string | number) => {
  if (!cohort) return '';

  const num = String(cohort).replace(/[^0-9]/g, '');
  return num ? `${num}기` : '';
};

const formatCohortToValue = (cohortLabel: string) => {
  return cohortLabel.replace(/[^0-9]/g, '');
};

function getEmailFromAccessToken(): string {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return '';

    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return '';

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');

    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map(
          (char) =>
            '%' + char.charCodeAt(0).toString(16).padStart(2, '0')
        )
        .join('')
    );

    const payload = JSON.parse(decoded);

    return typeof payload.sub === 'string' ? payload.sub : '';
  } catch {
    return '';
  }
}

export default function ProfileEditPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMyProfile();

        const rawCohort =
          (data as any).generation ?? data.cohort ?? '';

        const formattedCohort = formatCohortToLabel(rawCohort);

        const formattedDept =
          DEPARTMENT_LABEL_MAP[data.department] ||
          data.department ||
          '';

        const resolvedEmail =
          data.email || getEmailFromAccessToken();

        setForm({
          name: data.name || '',
          email: resolvedEmail,
          department: formattedDept,
          cohort: formattedCohort,
        });
      } catch {
        setError('프로필을 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsSaving(true);
    setError(null);

    try {
      const apiDepartment =
        DEPARTMENT_API_VALUES[form.department] ||
        form.department;

      const apiCohort = formatCohortToValue(form.cohort);

      await updateMyProfile({
        name: form.name,
        department: apiDepartment,
        cohort: apiCohort,
      });

      navigate('/mypage');
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <p className="text-gray-500 py-10 text-center">
        불러오는 중...
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">프로필 수정</h1>

      <p className="text-gray-400 mt-1">
        내 정보를 최신 상태로 관리하세요.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 bg-white border border-gray-200 rounded-xl p-8"
      >
        <label className="block text-sm font-medium mb-1">
          이름
        </label>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-5 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />

        <label className="block text-sm font-medium mb-1">
          학교 이메일
        </label>

        <input
          value={form.email}
          disabled
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-1 bg-gray-50 text-gray-400 cursor-not-allowed"
        />

        <p className="text-xs text-gray-400 mb-5">
          학교 이메일은 변경할 수 없어요.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              기수
            </label>

            <CustomSelect
              options={COHORT_OPTIONS as unknown as string[]}
              value={form.cohort}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  cohort: value,
                }))
              }
              placeholder="기수를 선택해 주세요."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              학과
            </label>

            <CustomSelect
              options={DEPARTMENT_OPTIONS as unknown as string[]}
              value={form.department}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  department: value,
                }))
              }
              placeholder="학과를 선택해 주세요."
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gray-900 text-white rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </button>
      </form>
    </div>
  );
}