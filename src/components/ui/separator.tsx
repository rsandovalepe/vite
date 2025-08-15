import { cn } from '@/lib/utils';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({
  orientation = 'horizontal',
  className,
}: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        'shrink-0 bg-border',
        orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full',
        className,
      )}
    />
  );
}
