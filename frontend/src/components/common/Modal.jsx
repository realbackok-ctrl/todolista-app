import { useEffect } from 'react';

/**
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} [title]
 * @param {React.ReactNode} children
 */
function Modal({ isOpen, onClose, title, children }) {
  // ESC 키 입력 시 모달을 닫는다. isOpen 상태가 바뀔 때마다 이벤트 리스너를 재등록한다.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-md w-full mx-4 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

export default Modal;
