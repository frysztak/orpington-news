import React, { Fragment, PropsWithChildren } from 'react';
import cx from 'classnames';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Transition } from '@headlessui/react';
import { IconButton } from '@components/button';

export const ModalRoot = DialogPrimitive.Root;
export const ModalTrigger = DialogPrimitive.Trigger;

type DialogContentPrimitiveProps = React.ComponentProps<
  typeof DialogPrimitive.Content
> & { open: boolean };
export const ModalContent = React.forwardRef<
  HTMLDivElement,
  DialogContentPrimitiveProps
>(({ children, open, ...props }, forwardedRef) => (
  <Transition.Root show={open}>
    <Transition.Child
      as={Fragment}
      enter="ease-out motion-safe:duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in motion-safe:duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <DialogPrimitive.Overlay
        forceMount
        className={cx('fixed inset-0', 'radix-state-open:bg-black/50')}
      />
    </Transition.Child>
    <Transition.Child
      as={Fragment}
      enter="ease-out motion-safe:duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in motion-safe:duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <DialogPrimitive.Content
        {...props}
        ref={forwardedRef}
        forceMount
        className={cx(
          'bg-white dark:bg-gray-700 drop-shadow-lg rounded-lg p-4 ',
          'fixed z-50',
          'w-[100vw] sm:w-[95vw] sm:max-w-lg md:w-full h-full sm:h-auto',
          'top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]'
        )}
      >
        {children}
      </DialogPrimitive.Content>
    </Transition.Child>
  </Transition.Root>
));
ModalContent.displayName = 'ModalContent';

export const ModalCloseButton: React.FC = (props) => (
  <DialogPrimitive.Close asChild>
    <IconButton
      className="absolute top-2 right-3 bg-transparent dark:bg-transparent"
      {...props}
    >
      <Cross1Icon />
    </IconButton>
  </DialogPrimitive.Close>
);

export const ModalHeader: React.FC<DialogPrimitive.DialogTitleProps> = ({
  children,
  ...rest
}) => {
  return (
    <DialogPrimitive.Title
      className="text-2xl font-semibold pb-4 text-gray-900 dark:text-gray-100"
      {...rest}
    >
      {children}
    </DialogPrimitive.Title>
  );
};

interface ModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  contentTestId?: string;
}
export const Modal: React.FC<PropsWithChildren<ModalProps>> = ({
  open,
  onOpenChange,
  contentTestId,
  children,
}) => {
  return (
    <ModalRoot open={open} onOpenChange={onOpenChange}>
      <ModalContent
        open={open}
        onOpenAutoFocus={(e) => e.preventDefault()}
        data-test={contentTestId}
      >
        {children}
      </ModalContent>
    </ModalRoot>
  );
};
