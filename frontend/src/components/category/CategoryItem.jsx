import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import useUpdateCategoryMutation from '../../queries/useUpdateCategoryMutation';
import useDeleteCategoryMutation from '../../queries/useDeleteCategoryMutation';

/**
 * @param {{ id: string, name: string }} category
 */
function CategoryItem({ category }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editError, setEditError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const handleEditStart = () => {
    setEditName(category.name);
    setEditError('');
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleEditSave = () => {
    if (!editName.trim()) {
      setEditError('카테고리 이름을 입력해 주세요');
      return;
    }
    setEditError('');

    updateMutation.mutate(
      { id: category.id, data: { name: editName.trim() } },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
        onError: (error) => {
          if (error?.response?.status === 409) {
            setEditError('이미 사용 중인 카테고리 이름입니다');
          }
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate(category.id, {
      onSuccess: () => setDeleteModalOpen(false),
    });
  };

  if (isEditing) {
    return (
      <div className="flex gap-2 items-start bg-white border border-blue-300 rounded-lg p-3">
        <div className="flex-1">
          <Input
            id={`edit-category-${category.id}`}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            error={editError}
            autoFocus
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            type="button"
            variant="primary"
            className="h-10 px-3 text-sm"
            onClick={handleEditSave}
            isLoading={updateMutation.isPending}
          >
            저장
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-10 px-3 text-sm"
            onClick={handleEditCancel}
          >
            취소
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
        <span className="text-sm font-medium text-gray-800">{category.name}</span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            onClick={handleEditStart}
          >
            수정
          </Button>
          <Button
            type="button"
            variant="danger"
            className="h-8 px-3 text-xs"
            onClick={() => setDeleteModalOpen(true)}
          >
            삭제
          </Button>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="카테고리 삭제"
      >
        <p className="text-sm text-gray-700">
          <span className="font-medium">&quot;{category.name}&quot;</span> 카테고리를 삭제하시겠습니까?
          연결된 할일의 카테고리가 해제됩니다.
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
    </>
  );
}

export default CategoryItem;
