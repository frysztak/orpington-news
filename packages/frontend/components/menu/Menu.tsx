import React, { PropsWithChildren, ReactNode } from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
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
      data-focus-visible-disabled
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
        'cursor-pointer'
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
