import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isOverdue, formatDate } from '../../utils/dateUtils';
import useToggleTodoMutation from '../../queries/useToggleTodoMutation';
import useDeleteTodoMutation from '../../queries/useDeleteTodoMutation';
import Button from '../common/Button';
import Modal from '../common/Modal';

/**
 * 할일 목록의 개별 카드 컴포넌트.
 * 상태(PENDING / COMPLETED / Overdue)에 따라 스타일이 다르게 적용된다.
 *
 * @param {{ todo: Object }} props
 */
function TodoItem({ todo }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toggleMutation = useToggleTodoMutation();
  const deleteMutation = useDeleteTodoMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const overdue = isOverdue(todo.dueDate, todo.status);
  const completed = todo.status === 'COMPLETED';

  const cardClass = [
    'p-4 rounded-lg border cursor-pointer transition-shadow hover:shadow-md',
    overdue
      ? 'bg-red-50 border-red-300'
      : completed
        ? 'bg-gray-50 border-gray-200'
        : 'bg-white border-gray-200',
  ].join(' ');

  const handleToggle = (e) => {
    e.stopPropagation();
    const newStatus = completed ? 'PENDING' : 'COMPLETED';
    toggleMutation.mutate({ id: todo.id, status: newStatus });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(todo.id, {
      onSuccess: () => setDeleteModalOpen(false),
    });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/todos/${todo.id}`);
  };

  return (
    <>
    <li className={cardClass} onClick={() => navigate(`/todos/${todo.id}`)}>
      <div className="flex items-start gap-3">
        {/* 체크박스 */}
        <button
          onClick={handleToggle}
          disabled={toggleMutation.isPending}
          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 border-gray-400 flex items-center justify-center transition-colors hover:border-blue-500 disabled:opacity-50"
          aria-label={completed ? t('todo.status.pending') : t('todo.status.completed')}
        >
          {completed && (
            <svg className="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* 본문 */}
        <div className="flex-1 min-w-0">
          {/* 제목 */}
          <p
            className={[
              'text-sm font-medium truncate',
              completed ? 'line-through text-gray-400' : 'text-gray-800',
            ].join(' ')}
          >
            {todo.title}
          </p>

          {/* 메타 정보: 카테고리 + 날짜 */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {(todo.category?.name || todo.categoryId) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                {todo.category?.name ?? `${t('common.category')} #${todo.categoryId}`}
              </span>
            )}
            {todo.dueDate && (
              <span
                className={[
                  'text-xs',
                  overdue ? 'text-red-500 font-medium' : 'text-gray-400',
                ].join(' ')}
              >
                {formatDate(todo.dueDate)}
              </span>
            )}
          </div>

          {/* Overdue 레이블 */}
          {overdue && (
            <p className="mt-1 text-xs text-red-500 font-semibold">{t('todo.overdue')}</p>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleEdit}
            className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded"
            aria-label={t('common.edit')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded disabled:opacity-50"
            aria-label={t('common.delete')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </li>

    <Modal
      isOpen={deleteModalOpen}
      onClose={() => setDeleteModalOpen(false)}
      title={t('common.delete')}
    >
      <p className="text-sm text-gray-700">{t('todo.form.deleteConfirm')}</p>
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
          onClick={handleDeleteConfirm}
          isLoading={deleteMutation.isPending}
          className="flex-1"
        >
          {t('common.delete')}
        </Button>
      </div>
    </Modal>
    </>
  );
}

export default TodoItem;
