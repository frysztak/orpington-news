import NextLink from 'next/link';
import { Box, BoxProps, Button, VStack } from '@chakra-ui/react';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { SettingsCategory } from './SettingsCategory';
import { SettingsLink } from './SettingsLink';

export type SettingsSidebarProps = BoxProps;

export const SettingsSidebar: React.FC<SettingsSidebarProps> = (props) => {
  return (
    <VStack w="full" align="flex-start" spacing={3} {...props}>
      <NextLink href="/" passHref>
        <Button mx={4} height={8} leftIcon={<IoReturnUpBack />} variant="link">
          Go back
        </Button>
      </NextLink>

      <Box as="h2" px={4} pt={4} textStyle="settings.header">
        Settings
      </Box>

      <SettingsCategory title="Collections">
        <SettingsLink href="/settings/appearance">Appearance</SettingsLink>
        <SettingsLink href="/settings/organize">Organize</SettingsLink>
      </SettingsCategory>

      <SettingsCategory title="Account">
        <SettingsLink href="/settings/info">Info</SettingsLink>
        <SettingsLink href="/settings/password">Change password</SettingsLink>
        <SettingsLink href="/settings/logout">Log out</SettingsLink>
      </SettingsCategory>

      <SettingsCategory title="About">
        <SettingsLink href="/settings/about">About</SettingsLink>
      </SettingsCategory>
    </VStack>
  );
};
