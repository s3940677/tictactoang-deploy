const styles = {
  error:   'bg-red-900/30 border-red-700/50 text-red-300',
  success: 'bg-emerald-900/30 border-emerald-700/50 text-emerald-300',
  warning: 'bg-yellow-900/30 border-yellow-700/50 text-yellow-300',
  info:    'bg-blue-900/30 border-blue-700/50 text-blue-300',
};

const icons = {
  error:   'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export default function Alert({ type = 'info', message, className = '' }) {
  if (!message) return null;
  return (
    <div className={`flex items-start gap-3 border rounded-lg p-4 text-sm ${styles[type]} ${className} animate-fade-in`}>
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[type]}/>
      </svg>
      <span>{message}</span>
    </div>
  );
}
