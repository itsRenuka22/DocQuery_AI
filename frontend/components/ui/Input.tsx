import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  helper,
  fullWidth = true,
  className,
  ...props
}: InputProps) {
  return (
    <div className={clsx(fullWidth && 'w-full')}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2 border border-gray-300 rounded-md',
          'focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent',
          'dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:focus:ring-sky-400',
          error && 'border-red-500 focus:ring-red-500 dark:focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>}
      {helper && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{helper}</p>
      )}
    </div>
  );
}
