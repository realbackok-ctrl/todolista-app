import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Input from '../common/Input';
import useCreateCategoryMutation from '../../queries/useCreateCategoryMutation';

function CategoryForm() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const createMutation = useCreateCategoryMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t('category.requiredError'));
      return;
    }
    setNameError('');

    createMutation.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName('');
        },
        onError: (error) => {
          if (error?.response?.status === 409) {
            setNameError(t('category.duplicateError'));
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <div className="flex-1">
        <Input
          id="new-category-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('category.addPlaceholder')}
          error={nameError}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        isLoading={createMutation.isPending}
        className="flex-shrink-0 mt-0"
      >
        {t('common.add')}
      </Button>
    </form>
  );
}

export default CategoryForm;
