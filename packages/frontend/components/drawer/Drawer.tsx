import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import cx from 'classnames';
import { IconButton } from '@components/button';

export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;

type DialogContentPrimitiveProps = React.ComponentProps<
  typeof DialogPrimitive.Content
>;
export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DialogContentPrimitiveProps
>(({ children, ...props }, forwardedRef) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cx(
        'fixed top-0 left-0 bottom-0 right-0',
        'radix-state-open:bg-black/50 radix-state-open:animate-fade-in radix-state-closed:animate-fade-out'
      )}
    />
    <DialogPrimitive.Content
      {...props}
      ref={forwardedRef}
      className={cx(
        'bg-white dark:bg-gray-700 fixed top-0 bottom-0 w-full sm:w-96',
        'radix-state-open:animate-enter-from-left radix-state-closed:animate-exit-to-left shadow-lg'
      )}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DrawerContent.displayName = 'DrawerContent';

export const DrawerCloseButton: React.FC = (props) => (
  <DialogPrimitive.Close asChild>
    <IconButton
      className="absolute top-2 right-3 bg-transparent dark:bg-transparent"
      {...props}
    >
      <Cross1Icon />
    </IconButton>
  </DialogPrimitive.Close>
);
