import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({ variant = 'default', size = 'sm', className, ...props }: BadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  };

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-100',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  };

  return (
    <span
      className={clsx('inline-block rounded-full font-medium', sizeClasses[size], variantClasses[variant], className)}
      {...props}
    />
  );
}
