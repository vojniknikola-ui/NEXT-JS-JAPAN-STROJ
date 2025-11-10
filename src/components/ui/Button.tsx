import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-[#ff6b00] hover:bg-[#ff7f1a] text-white focus:ring-[#ff6b00]',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-600',
    outline: 'border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white focus:ring-[#ff6b00]',
    ghost: 'text-[#ff6b00] hover:bg-[#ff6b00]/10 focus:ring-[#ff6b00]',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;