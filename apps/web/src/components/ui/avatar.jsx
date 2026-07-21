import { forwardRef } from 'react';
import { cn } from '../../lib/utils.js';

const Avatar = forwardRef(({ className, ...props }, ref) => (
  <span ref={ref} className={cn('relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-surface-200', className)} {...props} />
));
Avatar.displayName = 'Avatar';

const AvatarImage = forwardRef(({ className, ...props }, ref) => (
  <img ref={ref} className={cn('aspect-square h-full w-full object-cover', className)} {...props} />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = forwardRef(({ className, ...props }, ref) => (
  <span ref={ref} className={cn('flex h-full w-full items-center justify-center rounded-full text-sm font-medium text-surface-600', className)} {...props} />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
