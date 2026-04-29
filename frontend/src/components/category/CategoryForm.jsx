import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import useCreateCategoryMutation from '../../queries/useCreateCategoryMutation';

function CategoryForm() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const createMutation = useCreateCategoryMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('카테고리 이름을 입력해 주세요');
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
            setNameError('이미 사용 중인 카테고리 이름입니다');
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
          placeholder="새 카테고리 이름"
          error={nameError}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        isLoading={createMutation.isPending}
        className="flex-shrink-0 mt-0"
      >
        추가
      </Button>
    </form>
  );
}

export default CategoryForm;
