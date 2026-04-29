import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import useTodosQuery from '../queries/useTodosQuery';
import useCategoriesQuery from '../queries/useCategoriesQuery';
import TodoFilter from '../components/todo/TodoFilter';
import TodoList from '../components/todo/TodoList';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * 할일 목록 페이지.
 * 상태/카테고리 필터, FAB(할일 추가), 하단 탭 바를 포함한다.
 */
function TodoListPage() {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const navigate = useNavigate();
  const { logoutMutation } = useAuth();

  const { data: todosData, isLoading, error } = useTodosQuery({
    status: statusFilter || undefined,
    categoryId: categoryFilter || undefined,
  });

  const { data: categoriesData = [] } = useCategoriesQuery();

  const todos = Array.isArray(todosData)
    ? todosData
    : (todosData?.todos ?? []);

  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.categories ?? []);

  const enrichedTodos = todos.map((todo) => ({
    ...todo,
    category: categories.find((c) => c.id === todo.categoryId) || null,
  }));

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
      <header className="h-14 bg-white shadow-sm flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 font-bold text-lg">TodoLista</span>
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          {t('common.logout')}
        </button>
      </header>

      {/* 필터 */}
      <TodoFilter
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      {/* 컨텐츠 */}
      <main className="flex-1 px-4 py-3 pb-20 overflow-y-auto">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            <p>{t('error.fetchFailed')}</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        ) : (
          <TodoList todos={enrichedTodos} />
        )}
      </main>

      {/* FAB: 할일 추가 */}
      <button
        onClick={() => navigate('/todos/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-colors"
        aria-label={t('todo.form.newTitle')}
      >
        +
      </button>

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

export default TodoListPage;
