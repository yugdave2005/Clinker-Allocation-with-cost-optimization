import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'iu' | 'gu' | 'road' | 'rail' | 'bulk' | 'default' | 'success' | 'warning';
}

const variantStyles: Record<string, string> = {
  iu: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  gu: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  road: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  rail: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  bulk: 'bg-green-500/20 text-green-400 border-green-500/30',
  default: 'bg-slate-600/30 text-slate-300 border-slate-600/50',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border',
      variantStyles[variant],
      className
    )}
    {...props}
  >
    {children}
  </span>
);
