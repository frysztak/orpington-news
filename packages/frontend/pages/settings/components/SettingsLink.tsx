import React from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import {
  chakra,
  Icon,
  PropsOf,
  Show,
  useColorModeValue,
} from '@chakra-ui/react';
import { BsChevronRight } from '@react-icons/all-files/bs/BsChevronRight';

const StyledLink = React.forwardRef(function StyledLink(
  props: PropsOf<typeof chakra.a> & { isActive?: boolean },
  ref: React.Ref<any>
) {
  const { isActive, children, ...rest } = props;

  return (
    <chakra.a
      aria-current={isActive ? 'page' : undefined}
      width="100%"
      px="4"
      py="1"
      rounded="md"
      ref={ref}
      fontSize="sm"
      fontWeight="500"
      color={useColorModeValue('gray.700', 'white')}
      transition="all 0.2s"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      _activeLink={{
        bg: useColorModeValue('purple.50', 'purple.100'),
        color: 'purple.700',
        fontWeight: '600',
      }}
      {...rest}
    >
      {children}
      <Show below="sm">
        <Icon as={BsChevronRight} />
      </Show>
    </chakra.a>
  );
});

export type SettingsLinkProps = PropsOf<typeof chakra.div> & {
  href: string;
};

export const SettingsLink: React.FC<SettingsLinkProps> = (props) => {
  const { href, children, ...rest } = props;

  const { asPath } = useRouter();
  const isActive = asPath === href;

  return (
    <chakra.div
      userSelect="none"
      display="flex"
      alignItems="center"
      lineHeight="1.5rem"
      {...rest}
    >
      <NextLink href={href} passHref>
        <StyledLink isActive={isActive}>{children}</StyledLink>
      </NextLink>
    </chakra.div>
  );
};
