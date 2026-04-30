import { useParams, useNavigate } from 'react-router-dom';
import TodoForm from '../components/todo/TodoForm';
import useTodoQuery from '../queries/useTodoQuery';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * 할일 생성(/todos/new) 및 수정/상세(/todos/:id) 페이지.
 * id가 없으면 생성 모드, 있으면 수정 모드로 동작한다.
 *
 * 수정 완료 후: useUpdateTodoMutation이 TODO(id) 캐시를 무효화 → useTodoQuery 재요청
 * → todo.updatedAt 변경 → TodoForm key 변경 → 최신 값으로 폼 재초기화
 */
function TodoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = !id;

  const { data: todoData, isLoading, error } = useTodoQuery(isNew ? null : id);

  if (!isNew && isLoading) return <LoadingSpinner />;

  if (!isNew && error) {
    const is404 = error?.response?.status === 404;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600">
          {is404 ? '존재하지 않는 할일 입니다.' : '할일을 불러오지 못했습니다.'}
        </p>
        <button
          onClick={() => navigate('/todos')}
          className="mt-4 text-blue-500 hover:underline text-sm"
        >
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const todo = todoData?.todo ?? todoData;

  // 생성 모드: 저장 후 목록으로 이동 할것 
  // 수정 모드: onSuccess 없이 null → 저장 후 페이지 유지 (쿼리 무효화로 자동 반영)
  const createOnSuccess = () => navigate('/todos');

  return (
    <TodoForm
      key={isNew ? 'new' : todo?.updatedAt ?? id}
      mode={isNew ? 'create' : 'edit'}
      initialValues={isNew ? null : todo}
      todoId={id}
      onSuccess={isNew ? createOnSuccess : null}
      onDelete={() => navigate('/todos')}
    />
  );
}

export default TodoDetailPage;
