import React, { forwardRef } from 'react';
import NextLink from 'next/link';
import { fromUnixTime } from 'date-fns';
import { clamp } from 'rambda';
import cx from 'classnames';
import {
  CalendarDaysIcon,
  ClockIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { formatRelative } from '@utils';
import { CollectionItemProps } from '../../types';

export type ListItemProps = CollectionItemProps & {
  onReadingListButtonClicked?: () => void;
};

export const ListItem = forwardRef<HTMLAnchorElement, ListItemProps>(
  (props, ref) => {
    const { item, isActive, onReadingListButtonClicked } = props;
    const { id, title, collection, readingTime, dateRead, datePublished } =
      item;
    const readingTimeRounded = clamp(1, 99, Math.ceil(readingTime));

    const titleEl = (
      <h2
        className={cx('text-base w-full line-clamp-1 grow', {
          'font-medium': Boolean(dateRead),
          'font-bold': !Boolean(dateRead),
        })}
        data-test="title"
        data-test-read={Boolean(dateRead)}
      >
        {title}
      </h2>
    );

    const publishedEl = (
      <div
        title="Published on"
        className="flex flex-shrink-0 gap-x-1 items-center dark:text-gray-300 text-gray-700"
      >
        <CalendarDaysIcon className="h-4 w-4" />
        <span>{formatRelative(fromUnixTime(datePublished))}</span>
      </div>
    );

    const readingTimeEl = (
      <div
        title="Estimated reading time"
        className="flex items-center gap-x-1 dark:text-gray-300 text-gray-700"
      >
        <ClockIcon className="h-4 w-4" />
        <span style={{ width: '4ch' }}>{`${readingTimeRounded}m`}</span>
      </div>
    );

    return (
      <NextLink href={`/collection/${collection.id}/article/${id}`}>
        <a
          ref={ref}
          className={cx(
            'block mr-3 border rounded hover:bg-purple-50 hover:dark:bg-gray-700',
            {
              'border-transparent': !isActive,
              'border-purple-300 dark:border-gray-500': isActive,
            }
          )}
        >
          {/* Desktop */}
          <div className="hidden lg:flex items-center gap-x-2 w-full py-3 px-2">
            <div className="flex items-center flex-shrink-0 flex-grow-0 w-1/5 gap-x-1 break-all dark:text-gray-300 text-gray-700">
              <NewspaperIcon className="h-4 w-4" />
              <p className="line-clamp-1">{collection.title}</p>
            </div>
            {titleEl}
            {publishedEl}
            {readingTimeEl}
          </div>

          {/* Mobile */}
          <div className="lg:hidden flex-row w-full py-3 px-2 gap-2">
            {titleEl}
            <div className="flex gap-2 w-full justify-between">
              <div className="flex items-center gap-x-2 dark:text-gray-300 text-gray-700">
                <NewspaperIcon className="h-4 w-4 flex-shrink-0" />
                <p className="line-clamp-1">{collection.title}</p>
              </div>
              {publishedEl}
              {readingTimeEl}
            </div>
          </div>
        </a>
      </NextLink>
    );
  }
);

ListItem.displayName = 'ListItem';
