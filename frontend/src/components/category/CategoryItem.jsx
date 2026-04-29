import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import useUpdateCategoryMutation from '../../queries/useUpdateCategoryMutation';
import useDeleteCategoryMutation from '../../queries/useDeleteCategoryMutation';

/**
 * @param {{ id: string, name: string }} category
 */
function CategoryItem({ category }) {
  const { t } = useTranslation();
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
      setEditError(t('category.requiredError'));
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
            setEditError(t('category.duplicateError'));
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
            {t('common.save')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-10 px-3 text-sm"
            onClick={handleEditCancel}
          >
            {t('common.cancel')}
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
            {t('common.edit')}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="h-8 px-3 text-xs"
            onClick={() => setDeleteModalOpen(true)}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t('common.delete')}
      >
        <p className="text-sm text-gray-700">
          <span className="font-medium">&quot;{category.name}&quot;</span> {t('category.deleteConfirm')}
        </p>
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

export default CategoryItem;
