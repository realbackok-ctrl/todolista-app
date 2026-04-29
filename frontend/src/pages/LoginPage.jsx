import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import useAuth from '../hooks/useAuth';
import { validateEmail, validatePassword } from '../utils/validationUtils';

function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { loginMutation } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError(t('error.emailInvalid'));
      return;
    }
    if (!validatePassword(password)) {
      setError(t('error.passwordTooShort'));
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onError: (err) => {
          const status = err?.response?.status;
          if (status === 401) {
            setError(t('error.loginFailed'));
          } else {
            setError(t('error.generic'));
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-sm w-full">
        {/* 앱 헤더 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-2xl">✅</span>
            <h1 className="text-2xl font-bold text-gray-900">TodoList</h1>
          </div>
          <p className="text-sm text-gray-500">{t('todo.listTitle')}</p>
        </div>

        {/* 에러 배너 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <Input
            id="email"
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            autoComplete="email"
          />
          <Input
            id="password"
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={loginMutation.isPending}
            className="w-full mt-2"
          >
            {t('auth.login')}
          </Button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
