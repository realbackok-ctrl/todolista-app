const variantClasses = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

/**
 * @param {'primary'|'secondary'|'danger'} [variant='primary']
 * @param {boolean} [disabled]
 * @param {boolean} [isLoading] - true이면 스피너를 보여주고 클릭을 차단한다
 * @param {string} [className]
 */
function Button({ variant = 'primary', disabled, isLoading, children, className = '', ...props }) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center h-11 px-4 rounded-lg text-sm font-medium transition-colors',
        variantClasses[variant],
        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

export default Button;
