import { useTranslation } from 'react-i18next';

/**
 * 할일 목록 필터 컴포넌트.
 * 상태 필터(전체/미완료/완료)와 카테고리 필터를 제공한다.
 *
 * @param {{
 *   statusFilter: '' | 'PENDING' | 'COMPLETED',
 *   onStatusChange: (status: string) => void,
 *   categoryFilter: string,
 *   onCategoryChange: (categoryId: string) => void,
 *   categories: Array<{ id: number, name: string }>
 * }} props
 */
function TodoFilter({ statusFilter, onStatusChange, categoryFilter, onCategoryChange, categories }) {
  const { t } = useTranslation();
  const statusTabs = [
    { value: '', label: t('todo.status.all') },
    { value: 'PENDING', label: t('todo.status.pending') },
    { value: 'COMPLETED', label: t('todo.status.completed') },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-3">
      {/* 상태 필터 탭 */}
      <div className="flex gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusChange(tab.value)}
            className={[
              'flex-1 py-1.5 text-sm font-medium rounded-md transition-colors',
              statusFilter === tab.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 카테고리 필터 드롭다운 */}
      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{t('todo.categoryFilter')}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TodoFilter;
