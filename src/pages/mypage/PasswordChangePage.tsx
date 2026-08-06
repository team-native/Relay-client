import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/userApi';
import { PASSWORD_REGEX } from '../../constants/validation';

interface PasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_FORM: PasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function PasswordChangePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PasswordFormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isFormatValid = PASSWORD_REGEX.test(form.newPassword);
  const isMismatch = form.confirmPassword.length > 0 && form.newPassword !== form.confirmPassword;
  const canSubmit =
    form.currentPassword.length > 0 && isFormatValid && !isMismatch && form.confirmPassword.length > 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (serverError) setServerError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSaving(true);
    setServerError(null);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      navigate('/mypage');
    } catch (err) {
      setServerError('현재 비밀번호가 일치하지 않거나, 요청 처리 중 문제가 발생했어요.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">비밀번호 변경</h1>
      <p className="text-gray-400 mt-1">주기적으로 비밀번호를 변경해 계정을 안전하게 지키세요.</p>

      <form onSubmit={handleSubmit} className="mt-6 bg-white border border-gray-200 rounded-xl p-8">
        <label className="block text-sm font-medium mb-1">현재 비밀번호</label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="현재 비밀번호를 입력하세요."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-5 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />

        <label className="block text-sm font-medium mb-1">새 비밀번호</label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="영문, 숫자 포함 8자 이상"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
        />
        <p className="text-xs mt-1 mb-5">
        <span className="text-[#FFC83D] font-medium">필수</span>{' '}
        <span className="text-gray-400">
            영문 대소문자 + 숫자, 8자 이상 · 특수문자(&amp;@#$! 등) 사용 가능
        </span>
        </p>

        <label className="block text-sm font-medium mb-1">비밀번호 확인</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 ${
            isMismatch
              ? 'border-red-300 bg-red-50 focus:ring-red-300'
              : 'border-gray-200 focus:ring-amber-400'
          }`}
        />
        {isMismatch && (
          <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>
        )}

        {serverError && <p className="text-sm text-red-500 mt-4">{serverError}</p>}

        <button
          type="submit"
          disabled={!canSubmit || isSaving}
          className="w-full bg-gray-900 text-white rounded-lg py-3 font-medium mt-6 disabled:opacity-40"
        >
          {isSaving ? '변경 중...' : '변경하기'}
        </button>
      </form>
    </div>
  );
}