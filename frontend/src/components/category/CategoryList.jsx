import CategoryItem from './CategoryItem';

/**
 * @param {{ categories: Array<{id: string, name: string}> }} props
 */
function CategoryList({ categories }) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">카테고리가 없습니다.</p>
        <p className="text-xs mt-1">위에서 새 카테고리를 추가해 보세요.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {categories.map((category) => (
        <li key={category.id}>
          <CategoryItem category={category} />
        </li>
      ))}
    </ul>
  );
}

export default CategoryList;
