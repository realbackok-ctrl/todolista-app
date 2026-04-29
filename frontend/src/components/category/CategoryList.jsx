import { useTranslation } from 'react-i18next';
import CategoryItem from './CategoryItem';

/**
 * @param {{ categories: Array<{id: string, name: string}> }} props
 */
function CategoryList({ categories }) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">{t('category.empty')}</p>
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
