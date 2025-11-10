import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  const baseClasses = 'w-full rounded-2xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition focus:border-[#ff6b00]/50 focus:ring-2 focus:ring-[#ff6b00]/60';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-neutral-400">
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/60' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;