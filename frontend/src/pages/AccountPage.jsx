import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import useAuthStore from '../stores/authStore';
import useChangePasswordMutation from '../queries/useChangePasswordMutation';
import useDeleteAccountMutation from '../queries/useDeleteAccountMutation';

function AccountPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const changePasswordMutation = useChangePasswordMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setNewPasswordError('');
    setConfirmPasswordError('');
    setServerError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setNewPasswordError(t('error.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError(t('error.passwordMismatch'));
      return;
    }

    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          clearAuth();
          navigate('/login');
        },
        onError: (error) => {
          const status = error?.response?.status;
          if (status === 401) {
            setServerError(t('account.currentPassword') + ' ' + t('error.generic')); // Simplify or refine
          } else if (status === 400) {
            setServerError(t('error.generic'));
          } else {
            setServerError(t('error.generic'));
          }
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        clearAuth();
        navigate('/login');
      },
    });
  };

  const navItems = [
    {
      to: '/todos',
      label: t('common.todo'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      to: '/categories',
      label: t('common.category'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 014-4z" />
        </svg>
      ),
    },
    {
      to: '/account',
      label: t('common.account'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="h-14 bg-white shadow-sm flex items-center px-4 flex-shrink-0">
        <h1 className="text-base font-semibold text-gray-900">{t('account.settings')}</h1>
      </header>

      {/* 컨텐츠 */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 pb-20 flex flex-col gap-4">
        {/* 계정 정보 */}
        {user?.email && (
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-500">{t('auth.email')}</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">{user.email}</p>
          </div>
        )}

        {/* 비밀 번호 변경 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">{t('account.changePassword')}</h2>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
            <Input
              id="current-password"
              label={t('account.currentPassword')}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t('account.currentPasswordPlaceholder')}
              autoComplete="current-password"
            />
            <Input
              id="new-password"
              label={t('account.newPassword')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('account.newPasswordPlaceholder')}
              error={newPasswordError}
              autoComplete="new-password"
            />
            <Input
              id="confirm-password"
              label={t('account.newPasswordConfirm')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('account.newPasswordConfirmPlaceholder')}
              error={confirmPasswordError}
              autoComplete="new-password"
            />

            {serverError && (
              <p className="text-red-600 text-xs">{serverError}</p>
            )}
            {passwordSuccess && (
              <p className="text-green-600 text-xs">{t('account.passwordChanged')}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={changePasswordMutation.isPending}
            >
              {t('account.changePassword')}
            </Button>
          </form>
        </section>

        {/* 회원탈퇴 */}
        <section className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-900">{t('account.withdraw')}</h2>
          <p className="text-xs text-gray-500">
            {t('account.withdrawHint')}
          </p>
          <Button
            type="button"
            variant="danger"
            className="w-full"
            onClick={() => setDeleteModalOpen(true)}
          >
            {t('account.withdraw')}
          </Button>
        </section>
      </main>

      {/* 회원탈퇴 확인 모달 */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('account.withdraw')}
      >
        <p className="text-sm text-gray-700">
          {t('account.withdrawConfirm')}
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            isLoading={deleteAccountMutation.isPending}
            className="flex-1"
          >
            {t('account.withdraw')}
          </Button>
        </div>
      </Modal>

      {/* 하단 탭 바 */}
      <nav className="h-16 bg-white border-t border-gray-200 shadow-[0_-1px_4px_rgba(0,0,0,0.08)] flex items-center flex-shrink-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-xs font-medium transition-colors',
                isActive ? 'text-blue-500' : 'text-gray-400 hover:text-gray-600',
              ].join(' ')
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default AccountPage;
