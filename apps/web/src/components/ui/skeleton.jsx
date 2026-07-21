import { cn } from '../../lib/utils.js';

export function Skeleton({ className, ...props }) {
  return <div className={cn('animate-pulse-soft rounded-lg bg-surface-200', className)} {...props} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 space-y-4 animate-fade-in">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="pt-2 flex gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }) {
  return (
    <div className="flex gap-4 items-center py-3 px-4 border-b border-surface-100">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-1/3' : 'w-1/6'}`} />
      ))}
    </div>
  );
}
