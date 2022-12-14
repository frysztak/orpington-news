import React, { forwardRef, PropsWithChildren, ReactNode } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon } from '@radix-ui/react-icons';
import cx from 'classnames';

export const Menu = DropdownMenuPrimitive.Root;
export const MenuTrigger = DropdownMenuPrimitive.Trigger;

export const MenuContent: React.FC<PropsWithChildren<{}>> = ({
  children,
  ...rest
}) => {
  return (
    <DropdownMenuPrimitive.Content
      align="end"
      sideOffset={5}
      className={cx(
        'motion-safe:radix-side-top:animate-slide-up motion-safe:radix-side-bottom:animate-slide-down',
        'w-48 rounded-md py-1 shadow-2xl md:w-56 z-20',
        'border border-gray-200 dark:border-gray-600',
        'bg-white dark:bg-gray-700'
      )}
      {...rest}
    >
      {children}
    </DropdownMenuPrimitive.Content>
  );
};

type MenuItemProps = DropdownMenuPrimitive.MenuItemProps & {
  icon?: ReactNode;
};

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  children,
  ...rest
}) => {
  return (
    <DropdownMenuPrimitive.Item
      className={cx(
        'flex gap-x-2 cursor-default select-none items-center px-2 py-2 outline-none',
        'focus:bg-gray-50 dark:focus:bg-whiteAlpha-100',
        'text-gray-700 dark:text-gray-100',
        'cursor-pointer',
        'radix-disabled:opacity-40 radix-disabled:cursor-not-allowed'
      )}
      onClick={(event) => event.stopPropagation()}
      {...rest}
    >
      {icon}
      <span className="flex-grow">{children}</span>
    </DropdownMenuPrimitive.Item>
  );
};
MenuItem.displayName = 'MenuItem';

export const MenuDivider = () => (
  <DropdownMenuPrimitive.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-600" />
);

export const MenuLabel = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.MenuLabelProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.Label
      {...props}
      ref={forwardedRef}
      className="px-4 py-2 font-semibold text-sm"
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
});
MenuLabel.displayName = 'MenuLabel';

export const MenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

export const MenuRadioItem = forwardRef<
  HTMLDivElement,
  DropdownMenuPrimitive.DropdownMenuRadioItemProps
>(({ children, ...props }, forwardedRef) => {
  return (
    <DropdownMenuPrimitive.RadioItem
      {...props}
      ref={forwardedRef}
      className={cx(
        'flex gap-x-2 cursor-default select-none items-center px-2 py-2 outline-none',
        'focus:bg-gray-50 dark:focus:bg-whiteAlpha-100',
        'text-gray-700 dark:text-gray-100',
        'cursor-pointer'
      )}
    >
      <DropdownMenuPrimitive.ItemIndicator
        forceMount
        className="radix-state-unchecked:opacity-0 radix-state-checked:opacity-1"
      >
        <CheckIcon />
      </DropdownMenuPrimitive.ItemIndicator>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});
MenuRadioItem.displayName = 'MenuRadioItem';
