import React from 'react';
import clsx from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 rounded-lg shadow-soft border border-gray-200 dark:border-slate-700',
    elevated: 'bg-white dark:bg-slate-800 rounded-lg shadow-medium border border-gray-200 dark:border-slate-700',
    outlined: 'bg-white dark:bg-slate-900 rounded-lg border-2 border-gray-200 dark:border-slate-700',
  };

  return (
    <div
      className={clsx(variantClasses[variant], paddingClasses[padding], className)}
      {...props}
    />
  );
}
