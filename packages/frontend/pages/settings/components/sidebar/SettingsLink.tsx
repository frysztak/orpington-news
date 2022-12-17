import React, { PropsWithChildren } from 'react';
import cx from 'classnames';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { BsChevronRight } from '@react-icons/all-files/bs/BsChevronRight';

const StyledLink = React.forwardRef(function StyledLink(
  props: PropsWithChildren<{ isActive?: boolean }>,
  ref: React.Ref<any>
) {
  const { isActive, children, ...rest } = props;

  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cx(
        'cursor-pointer',
        'flex items-center justify-between',
        'w-full px-4 py-1 rounded-md transition-all text-sm',
        {
          'text-gray-700 dark:text-white font-medium': !isActive,
          'bg-purple-50 dark:bg-purple-100 text-purple-700 font-semibold':
            isActive,
        }
      )}
      ref={ref}
      {...rest}
    >
      {children}
      <BsChevronRight className="md:hidden" />
    </a>
  );
});

export type SettingsLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
}>;

export const SettingsLink: React.FC<SettingsLinkProps> = (props) => {
  const { href, children, ...rest } = props;

  const { asPath } = useRouter();
  const isActive = asPath === href;

  return (
    <div className="select-none flex items-center leading-6" {...rest}>
      <NextLink href={href} passHref>
        <StyledLink isActive={isActive}>{children}</StyledLink>
      </NextLink>
    </div>
  );
};
