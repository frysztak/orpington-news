import React, { PropsWithChildren } from 'react';
import cx from 'classnames';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { BsChevronRight } from '@react-icons/all-files/bs/BsChevronRight';

export type SettingsLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
}>;

export const SettingsLink: React.FC<SettingsLinkProps> = (props) => {
  const { href, children, className } = props;

  const { asPath } = useRouter();
  const isActive = asPath === href;

  return (
    <div className="select-none flex items-center leading-6">
      <NextLink
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cx(
          'cursor-pointer',
          'flex items-center justify-between',
          'w-full px-4 py-1 rounded-md transition-all text-sm',
          {
            'text-gray-700 dark:text-white font-medium': !isActive,
            'bg-purple-50 dark:bg-purple-100 text-purple-700 font-semibold':
              isActive,
          },
          className
        )}
      >
        {children}
        <BsChevronRight className="md:hidden" />
      </NextLink>
    </div>
  );
};
