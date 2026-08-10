import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../api/userApi';

// 비밀번호 정규식 (영문, 숫자, 특수문자 포함 8자 이상)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export default function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // 1. 유효성 검사 - 빈값
    if (!currentPassword.trim()) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (!newPassword.trim()) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }
    if (!confirmPassword.trim()) {
      setError('새 비밀번호 확인을 입력해주세요.');
      return;
    }

    // 2. 새 비밀번호 일치 확인
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    // 3. 현재 비밀번호와 새 비밀번호 동일 여부
    if (currentPassword === newPassword) {
      setError('새 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.');
      return;
    }

    // 4. 비밀번호 정규식 검증
    if (!PASSWORD_REGEX.test(newPassword)) {
      setError('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
      return;
    }

    try {
      setIsLoading(true);

      // 💡 백엔드로 보낼 때 'currentPassword', 'newPassword', 'newPasswordConfirm' 3개를 전달합니다.
      await changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm: confirmPassword,
      });

      setSuccess('비밀번호가 성공적으로 변경되었습니다!');
      setTimeout(() => {
        navigate('/mypage');
      }, 1500);
    } catch (err: any) {
      console.error('비밀번호 변경 실패:', err);
      
      // 백엔드에서 400 에러 시 보내준 예외 메시지 출력
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      if (serverMessage) {
        setError(serverMessage);
      } else if (err.response?.status === 400) {
        setError('현재 비밀번호가 일치하지 않거나 요청 형식이 올바르지 않습니다.');
      } else {
        setError('요청 처리 중 문제가 발생했어요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-1">비밀번호 변경</h1>
      <p className="text-sm text-gray-400 mb-8">
        주기적으로 비밀번호를 변경해 계정을 안전하게 지키세요.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        {/* 현재 비밀번호 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            현재 비밀번호
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="현재 비밀번호를 입력해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm"
          />
        </div>

        {/* 새 비밀번호 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            새 비밀번호
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="새 비밀번호를 입력해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            필수: 영문 대소문자 + 숫자, 8자 이상, 특수문자(!@#$%^&* 등) 사용 가능
          </p>
        </div>

        {/* 새 비밀번호 확인 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="새 비밀번호를 다시 입력해주세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all text-sm"
          />
        </div>

        {/* 에러/성공 메시지 */}
        {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        {success && <p className="text-sm text-green-600 font-medium">{success}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1e232a] text-white font-semibold py-3.5 rounded-xl hover:bg-black transition-colors disabled:opacity-50 text-sm mt-4"
        >
          {isLoading ? '변경 중...' : '변경하기'}
        </button>
      </form>
    </div>
  );
}