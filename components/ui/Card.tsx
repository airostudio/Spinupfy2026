import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl transition-all duration-200';

    const variantStyles = {
      default: 'bg-gray-900 border border-gray-800',
      glass: 'glass border border-gray-800/50',
      gradient:
        'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700',
    };

    const hoverStyles = hover
      ? 'hover:scale-[1.02] hover:shadow-xl hover:border-primary-500/50 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(baseStyles, variantStyles[variant], hoverStyles, className)
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge(clsx('p-6 border-b border-gray-800', className))}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = 'CardHeader';

export const CardContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={twMerge(clsx('p-6', className))} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={twMerge(
        clsx('p-6 border-t border-gray-800 bg-gray-900/50', className)
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = 'CardFooter';
