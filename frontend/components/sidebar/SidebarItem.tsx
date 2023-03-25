import React, { MouseEvent, useCallback } from 'react';
import cx from 'classnames';
import { Icon as IconifyIcon } from '@iconify/react';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';
import { CgRemove } from '@react-icons/all-files/cg/CgRemove';
import { IoRefresh } from '@react-icons/all-files/io5/IoRefresh';
import { AiTwotoneEdit } from '@react-icons/all-files/ai/AiTwotoneEdit';
import checkCircleOutline from '@iconify/icons-mdi/check-circle-outline';
import {
  Menu,
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuTrigger,
} from '@components/menu';
import { IconButton } from '@components/button';
import { Chevron } from './Chevron';
import { calcItemPadding } from './calcItemPadding';
import { Spinner } from '@components/spinner';

export type CollectionMenuAction = 'markAsRead' | 'refresh' | 'edit' | 'delete';

type BadgeTriggerProps = Pick<React.ComponentProps<'div'>, 'onPointerDown'> & {
  counter: number;
};
const BadgeTrigger = React.forwardRef<HTMLButtonElement, BadgeTriggerProps>(
  ({ counter, ...rest }, ref) => (
    <div
      className="group"
      onClick={(event) => event.stopPropagation()}
      {...rest}
    >
      <IconButton
        ref={ref}
        aria-label="Menu"
        tabIndex={0}
        data-test="menuButton"
        data-state={(rest as any)['data-state']}
        className="h-8 w-8 hidden group-hover:inline-flex radix-state-open:inline-flex"
      >
        <BsThreeDotsVertical />
      </IconButton>
      {counter > 0 ? (
        <div
          className={cx(
            'group-hover:hidden radix-state-open:hidden',
            'h-8 w-8 px-1 rounded text-xs font-bold uppercase whitespace-nowrap flex items-center justify-center',
            'text-purple-700 bg-purple-50 dark:text-purple-200 dark:bg-purple-200 dark:bg-opacity-10'
          )}
          data-test="badge"
          data-state={(rest as any)['data-state']}
        >
          {counter > 999 ? '999+' : counter}
        </div>
      ) : (
        <div
          data-state={(rest as any)['data-state']}
          className="w-8 h-8 group-hover:hidden radix-state-open:hidden"
        />
      )}
    </div>
  )
);
BadgeTrigger.displayName = 'BadgeTrigger';

export interface SidebarItemProps {
  isActive: boolean;
  icon?: React.FC;
  title: string;
  counter?: number;
  chevron?: 'top' | 'bottom';
  noMenu?: boolean;
  isLoading?: boolean;
  level?: number;
  style?: React.CSSProperties;

  onClick: () => void;
  onChevronClick?: () => void;
  onMenuActionClicked?: (action: CollectionMenuAction) => void;
}

export const SidebarItem = React.forwardRef<HTMLDivElement, SidebarItemProps>(
  (props, ref) => {
    const {
      isActive,
      icon,
      title,
      counter,
      chevron,
      noMenu,
      isLoading,
      onClick,
      onChevronClick,
      onMenuActionClicked,
      level,
      style,
      ...rest
    } = props;

    const handleKeyDown: React.KeyboardEventHandler = useCallback(
      (event) => {
        const { key } = event;
        if (key === 'Enter') {
          onClick();
        }
      },
      [onClick]
    );

    const handleChevronClick = useCallback(
      (e?: MouseEvent) => {
        e?.stopPropagation();
        onChevronClick?.();
      },
      [onChevronClick]
    );

    const fg = 'text-purple.700 dark:text-white';
    return (
      <div
        ref={ref}
        className={cx(
          'flex items-center gap-4',
          'w-full pr-3 min-h-[2.5rem]',
          'hover:bg-purple-10 dark:hover:bg-gray-600',
          'focus:bg-purple-10 dark:focus:bg-gray-600',
          'transition-colors',
          'cursor-pointer group select-none',
          {
            'bg-purple-50 dark:bg-gray-700': isActive,
          }
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          ...style,
          paddingLeft: calcItemPadding(chevron, level),
        }}
        data-test="group"
        {...rest}
      >
        {chevron && (
          <IconButton
            className="bg-transparent dark:bg-transparent ml-1 -mr-3 h-4 w-4 px-1"
            aria-label={chevron === 'bottom' ? 'Collapse menu' : 'Expand menu'}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={handleChevronClick}
            data-test={
              chevron === 'bottom' ? 'chevronCollapse' : 'chevronExpand'
            }
          >
            <Chevron pointTo={chevron} />
          </IconButton>
        )}
        {icon && (
          <span className={cx(fg, 'w-6 h-6 flex-shrink-0')}>
            {icon({ style: { width: '100%', height: '100%' } })}
          </span>
        )}
        <p
          className={cx('flex-grow py-2 break-words min-w-0', fg, {
            'font-bold': isActive,
          })}
          data-test="title"
        >
          {title}
        </p>

        {isLoading ? (
          <Spinner className="flex-shrink-0 m-1" />
        ) : noMenu ? (
          <div className="h-8 w-8" />
        ) : (
          <Menu>
            <MenuTrigger asChild>
              <BadgeTrigger counter={counter!} />
            </MenuTrigger>
            <MenuContent data-test="menuList">
              <MenuItem
                icon={<IconifyIcon icon={checkCircleOutline} />}
                onSelect={() => onMenuActionClicked?.('markAsRead')}
                data-test="markAsRead"
              >
                Mark all as read
              </MenuItem>
              <MenuItem
                icon={<IoRefresh />}
                onSelect={() => onMenuActionClicked?.('refresh')}
                data-test="refresh"
              >
                Refresh
              </MenuItem>
              <MenuItem
                icon={<AiTwotoneEdit />}
                onSelect={() => onMenuActionClicked?.('edit')}
                data-test="edit"
              >
                Edit
              </MenuItem>

              <MenuDivider />

              <MenuItem
                icon={<CgRemove />}
                onSelect={() => onMenuActionClicked?.('delete')}
                data-test="delete"
              >
                Delete
              </MenuItem>
            </MenuContent>
          </Menu>
        )}
      </div>
    );
  }
);
SidebarItem.displayName = 'SidebarItem';
