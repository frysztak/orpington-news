import NextLink from 'next/link';
import { Box, BoxProps, Button, VStack } from '@chakra-ui/react';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { SettingsCategory } from './SettingsCategory';
import { SettingsLink } from './SettingsLink';

export type SettingsSidebarProps = BoxProps;

export const SettingsSidebar: React.FC<SettingsSidebarProps> = (props) => {
  return (
    <VStack w="full" align="flex-start" spacing={3} {...props}>
      <Button
        as={NextLink}
        href="/"
        mx={4}
        height={8}
        leftIcon={<IoReturnUpBack />}
        variant="link"
      >
        Go back
      </Button>

      <Box as="h2" px={4} pt={4} textStyle="settings.header">
        Settings
      </Box>

      <SettingsCategory title="Appearance">
        <SettingsLink href="/settings/appearance">Appearance</SettingsLink>
      </SettingsCategory>

      <SettingsCategory title="Collections">
        <SettingsLink
          href="/settings/collections/organize"
          className="touch:hidden"
        >
          Organize
        </SettingsLink>
        <SettingsLink href="/settings/collections/import">Import</SettingsLink>
      </SettingsCategory>

      <SettingsCategory title="Account">
        <SettingsLink href="/settings/account/info">Info</SettingsLink>
        <SettingsLink href="/settings/account/password">
          Change password
        </SettingsLink>
        <SettingsLink href="/settings/account/logout">Log out</SettingsLink>
      </SettingsCategory>

      <SettingsCategory title="About">
        <SettingsLink href="/settings/hotkeys">Hotkeys</SettingsLink>
        <SettingsLink href="/settings/about">About</SettingsLink>
      </SettingsCategory>
    </VStack>
  );
};
