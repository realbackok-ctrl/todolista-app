import { useTranslation } from 'react-i18next';
import TodoItem from './TodoItem';

/**
 * 할일 목록 컴포넌트.
 * todos가 비어있으면 빈 상태 안내 메시지를 표시한다.
 *
 * @param {{ todos: Object[] }} props
 */
function TodoList({ todos }) {
  const { t } = useTranslation();
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>{t('todo.empty')}</p>
        <p className="text-sm mt-1">{t('todo.addHint')}</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

export default TodoList;
