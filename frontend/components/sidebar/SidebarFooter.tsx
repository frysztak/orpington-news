import {
  Center,
  HStack,
  Icon,
  Link,
  useColorModeValue,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { RiSettingsLine } from '@react-icons/all-files/ri/RiSettingsLine';
import type { Preferences, User } from '@shared';
import { useIconFill } from '@utils/icon';
import { Avatar } from './Avatar';

export interface SidebarFooterProps {
  user: User;
  preferences: Preferences;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = (props) => {
  const { user, preferences } = props;
  const fg = useIconFill();
  const hoverBg = useColorModeValue('purple.10', 'gray.600');

  return (
    <HStack justify="space-between">
      <Avatar
        name={user.displayName}
        src={user.avatarUrl}
        avatarStyle={preferences.avatarStyle}
      />

      <Link as={NextLink} href="/settings" aria-label="Open settings">
        <Center
          p={2}
          borderRadius="md"
          _hover={{
            backgroundColor: hoverBg,
          }}
        >
          <Icon as={RiSettingsLine} w={8} h={8} color={fg} />
        </Center>
      </Link>
    </HStack>
  );
};
