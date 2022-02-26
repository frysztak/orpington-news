import { BoxProps, Heading, VStack } from '@chakra-ui/react';
import { SettingsCategory } from './SettingsCategory';
import { SettingsLink } from './SettingsLink';

export type SettingsSidebarProps = BoxProps;

export const SettingsSidebar: React.FC<SettingsSidebarProps> = (props) => {
  return (
    <VStack w="full" align="flex-start" spacing={3} {...props}>
      <Heading px={4} fontSize="2xl">
        Settings
      </Heading>

      <SettingsCategory title="Collections">
        <SettingsLink href="/settings/organize">Organize</SettingsLink>
      </SettingsCategory>

      <SettingsCategory title="Customize">
        <SettingsLink href="/settings/appearance">Appearance</SettingsLink>
      </SettingsCategory>
    </VStack>
  );
};
