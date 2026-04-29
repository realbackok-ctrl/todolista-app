/**
 * @param {string} [label] - 입력 필드 위에 표시할 레이블
 * @param {string} [error] - 에러 메시지 (있으면 필드 하단 빨간 텍스트로 표시)
 * @param {string} [type='text']
 * @param {string} [id]
 */
function Input({ label, error, type = 'text', id, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={[
          'h-10 px-3 rounded-lg border text-sm text-gray-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />
      {error && <span className="text-red-600 text-xs">{error}</span>}
    </div>
  );
}

export default Input;
