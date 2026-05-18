const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  success:   'btn-success',
  ghost:     'text-slate-300 hover:text-white hover:bg-slate-700 py-2.5 px-5 rounded-lg transition-all duration-150 font-semibold',
};

const sizes = {
  sm:  'text-sm py-1.5 px-3',
  md:  '',
  lg:  'text-base py-3 px-7',
  xl:  'text-lg py-3.5 px-8',
  icon:'p-2',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) {
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className} inline-flex items-center justify-center gap-2`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      )}
      {children}
    </button>
  );
}
