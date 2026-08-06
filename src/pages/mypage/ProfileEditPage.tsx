import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { getMyProfile, updateMyProfile } from '../../api/userApi';
import { DEPARTMENT_OPTIONS, COHORT_OPTIONS } from '../../constants/profileOptions';
import CustomSelect from '../../components/ui/CustomSelect';

interface ProfileFormState {
  name: string;
  email: string;
  department: string;
  cohort: string;
}

const EMPTY_FORM: ProfileFormState = { name: '', email: '', department: '', cohort: '' };

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await getMyProfile();
        setForm({
          name: data.name,
          email: data.email,
          department: data.department,
          cohort: data.cohort,
        });
      } catch (err) {
        setError('프로필을 불러오지 못했어요.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있어요.');
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      // TODO: avatarFile 있으면 별도 업로드 API 호출 (백엔드 스펙 정해지면 이어서 작업)
      await updateMyProfile({
        name: form.name,
        department: form.department,
        cohort: form.cohort,
      });
      navigate('/mypage');
    } catch (err) {
      setError('저장에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <p className="text-gray-500">불러오는 중...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">프로필 수정</h1>
      <p className="text-gray-400 mt-1">내 정보를 최신 상태로 관리하세요.</p>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex justify-center mb-8">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="프로필 미리보기"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-900 text-white flex items-center justify-center text-2xl font-semibold">
                {form.name.charAt(0)}
              </div>
            )}

            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center"
              aria-label="프로필 사진 변경"
            >
              <Pencil className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">이름</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-5 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />

        <label className="block text-sm font-medium mb-1">학교 이메일</label>
        <input
          value={form.email}
          disabled
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-1 bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mb-5">학교 이메일은 변경할 수 없어요.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">기수</label>
            <CustomSelect
              options={COHORT_OPTIONS}
              value={form.cohort}
              onChange={(value) => setForm((prev) => ({ ...prev, cohort: value }))}
              placeholder="기수를 선택해 주세요."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">학과</label>
            <CustomSelect
              options={DEPARTMENT_OPTIONS}
              value={form.department}
              onChange={(value) => setForm((prev) => ({ ...prev, department: value }))}
              placeholder="학과를 선택해 주세요."
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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