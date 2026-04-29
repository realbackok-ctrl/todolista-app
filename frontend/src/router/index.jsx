import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import TodoListPage from '../pages/TodoListPage';
import TodoDetailPage from '../pages/TodoDetailPage';
import CategoryPage from '../pages/CategoryPage';
import AccountPage from '../pages/AccountPage';

/**
 * 미인증 사용자를 로그인 페이지로 리다이렉트한다.
 * token이 없으면 /login으로, 있으면 children을 그대로 렌더링.
 */
function PrivateRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

/**
 * 이미 인증된 사용자가 로그인/회원가입 페이지에 접근하는 것을 막는다.
 * token이 있으면 /todos로, 없으면 children을 그대로 렌더링.
 */
function PublicRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (token) return <Navigate to="/todos" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/todos" replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/todos"
        element={
          <PrivateRoute>
            <TodoListPage />
          </PrivateRoute>
        }
      />
      {/* /todos/new는 /todos/:id 보다 먼저 정의해야 충돌 없음 */}
      <Route
        path="/todos/new"
        element={
          <PrivateRoute>
            <TodoDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/todos/:id"
        element={
          <PrivateRoute>
            <TodoDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <CategoryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/account"
        element={
          <PrivateRoute>
            <AccountPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
