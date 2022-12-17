import React, { Fragment, PropsWithChildren } from 'react';
import { Transition } from '@headlessui/react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import cx from 'classnames';
import { Button } from '@chakra-ui/react';

interface AlertDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  isDeleting?: boolean;
  title: string;
  description: string;
  actionLabel: string;
  onAction?: () => void;
}
export const AlertDialog: React.FC<PropsWithChildren<AlertDialogProps>> = ({
  open,
  onOpenChange,
  isDeleting,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogPrimitive.Overlay
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
          <AlertDialogPrimitive.Content
            forceMount
            className={cx(
              'bg-white dark:bg-gray-700 drop-shadow-lg',
              'fixed z-50',
              'w-[100vw] sm:w-[95vw] sm:max-w-lg rounded-lg p-4 md:w-full',
              'top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]'
            )}
          >
            <AlertDialogPrimitive.Title className="text-2xl font-semibold pb-4 text-gray-900 dark:text-gray-100">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="mt-2 font-normal text-gray-900 dark:text-gray-100">
              {description}
            </AlertDialogPrimitive.Description>
            <div className="mt-4 flex justify-end space-x-2">
              <AlertDialogPrimitive.Cancel asChild data-test="cancel">
                <Button isLoading={isDeleting}>Cancel</Button>
              </AlertDialogPrimitive.Cancel>

              <Button
                isLoading={isDeleting}
                colorScheme="red"
                onClick={onAction}
                data-test="action"
              >
                {actionLabel}
              </Button>
            </div>
          </AlertDialogPrimitive.Content>
        </Transition.Child>
      </Transition.Root>
    </AlertDialogPrimitive.Root>
  );
};
