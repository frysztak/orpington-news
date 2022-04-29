import { HStack, Icon, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { RiSettingsLine } from '@react-icons/all-files/ri/RiSettingsLine';
import type { Preferences, User } from '@orpington-news/shared';
import { useIconFill } from '@utils/icon';
import { Avatar } from './Avatar';

export interface SidebarFooterProps {
  user: User;
  preferences: Preferences;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = (props) => {
  const { user, preferences } = props;
  const fg = useIconFill();

  return (
    <HStack justify="space-between">
      <Avatar
        name={user.displayName}
        src={user.avatar}
        avatarStyle={preferences.avatarStyle}
      />

      <NextLink href="/settings" passHref>
        <Link aria-label="Open settings">
          <Icon as={RiSettingsLine} w={8} h={8} color={fg} />
        </Link>
      </NextLink>
    </HStack>
  );
};
