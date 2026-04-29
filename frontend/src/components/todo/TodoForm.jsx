import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import useCategoriesQuery from '../../queries/useCategoriesQuery';
import useCreateTodoMutation from '../../queries/useCreateTodoMutation';
import useUpdateTodoMutation from '../../queries/useUpdateTodoMutation';
import useDeleteTodoMutation from '../../queries/useDeleteTodoMutation';
import useToggleTodoMutation from '../../queries/useToggleTodoMutation';
import { formatDate } from '../../utils/dateUtils';

/**
 * ISO 날짜 문자열을 datetime-local input 형식으로 변환한다.
 * '2026-04-30T18:00:00.000Z' → '2026-04-30T18:00' (로컬 시간 기준)
 * @param {string|null|undefined} isoString
 * @returns {string}
 */
function formatDueDateForInput(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d}T${h}:${mi}`;
}

/**
 * 할일 생성/수정 폼 컴포넌트
 *
 * @param {'create'|'edit'} mode - 생성 또는 수정 모드
 * @param {{ title, description, categoryId, dueDate, status, createdAt }} [initialValues] - 수정 모드에서 초기값
 * @param {string} [todoId] - 수정/삭제/토글에 사용할 할일 ID
 * @param {function} [onSuccess] - 저장/삭제 완료 후 호출되는 콜백
 */
function TodoForm({ mode, initialValues, todoId, onSuccess, onDelete }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';

  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [dueDate, setDueDate] = useState(formatDueDateForInput(initialValues?.dueDate));
  const [titleError, setTitleError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: categoriesData } = useCategoriesQuery();
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData?.categories ?? []);

  const createMutation = useCreateTodoMutation();
  const updateMutation = useUpdateTodoMutation();
  const deleteMutation = useDeleteTodoMutation();
  const toggleMutation = useToggleTodoMutation();

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError(t('todo.form.titlePlaceholder'));
      return;
    }
    setTitleError('');

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      categoryId: categoryId || null,
      dueDate: dueDate || null,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: todoId, data: payload },
        {
          onSuccess: () => {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(payload, { onSuccess });
    }
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(todoId, {
      onSuccess: () => {
        setDeleteModalOpen(false);
        onDelete?.();
      },
    });
  };

  const handleToggle = () => {
    const newStatus = initialValues?.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    toggleMutation.mutate({ id: todoId, status: newStatus });
  };

  const isCompleted = initialValues?.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="h-14 bg-white shadow-sm px-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/todos')}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="text-lg leading-none">&larr;</span>
          <span>{t('common.back')}</span>
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-base font-semibold text-gray-900">
          {isEdit ? t('todo.form.editTitle') : t('todo.form.newTitle')}
        </h1>
      </header>

      {/* 본문 */}
      <main className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-4">
        {/* 수정 완료 배너 */}
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
            변경 사항이 저장되었습니다.
          </div>
        )}

        {/* 수정 모드: 상태 표시 + 토글 */}
        {isEdit && (
          <div className="flex items-center gap-3">
            <span
              className={[
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                isCompleted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700',
              ].join(' ')}
            >
              {isCompleted ? 'COMPLETED' : 'PENDING'}
            </span>
            <Button
              type="button"
              variant="secondary"
              className="h-7 px-3 text-xs"
              onClick={handleToggle}
              isLoading={toggleMutation.isPending}
            >
              {isCompleted ? '미완료로 변경' : '완료로 변경'}
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 제목 */}
          <Input
            id="todo-title"
            label="제목 *"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={titleError}
            placeholder="할일 제목을 입력하세요"
          />

          {/* 설명 */}
          <div className="flex flex-col gap-1">
            <label htmlFor="todo-description" className="text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              id="todo-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명을 입력하세요 (선택)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* 카테고리 */}
          <div className="flex flex-col gap-1">
            <label htmlFor="todo-category" className="text-sm font-medium text-gray-700">
              카테고리
            </label>
            <select
              id="todo-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">카테고리 없음</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 종료일 */}
          <Input
            id="todo-due-date"
            label="종료일"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* 수정 모드: 생성일 (읽기전용) */}
          {isEdit && initialValues?.createdAt && (
            <p className="text-xs text-gray-500">
              생성일: {formatDate(initialValues.createdAt)}
            </p>
          )}

          {/* 저장 버튼 */}
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSaving}
          >
            {isEdit ? '변경 저장' : '할일 추가'}
          </Button>

          {/* 삭제 버튼 (수정 모드에서만) */}
          {isEdit && (
            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={() => setDeleteModalOpen(true)}
            >
              이 할일 삭제
            </Button>
          )}
        </form>
      </main>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="할일 삭제"
      >
        <p className="text-sm text-gray-700">
          이 할일을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setDeleteModalOpen(false)}
            className="flex-1"
          >
            취소
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            isLoading={deleteMutation.isPending}
            className="flex-1"
          >
            삭제
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default TodoForm;
