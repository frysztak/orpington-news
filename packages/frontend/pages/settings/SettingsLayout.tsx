import NextLink from 'next/link';
import { HStack, Divider, Show, IconButton, VStack } from '@chakra-ui/react';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { SettingsSidebar } from './components/sidebar/SettingsSidebar';

export interface SettingsLayoutProps {}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  return (
    <HStack w="full" h="full" align="flex-start" flexGrow={1}>
      <Show above="sm">
        <HStack w={60} h="100vh" align="flex-start" px={2} flexShrink={0}>
          <SettingsSidebar py={4} />
          <Divider orientation="vertical" h="full" />
        </HStack>
        {children}
      </Show>

      <Show below="sm">
        <VStack spacing={2} align="flex-start">
          <NextLink href="/settings" passHref>
            <IconButton
              icon={<IoReturnUpBack />}
              aria-label="Go back to settings"
              variant="ghost"
              mr="auto"
            />
          </NextLink>
          {children}
        </VStack>
      </Show>
    </HStack>
  );
};
