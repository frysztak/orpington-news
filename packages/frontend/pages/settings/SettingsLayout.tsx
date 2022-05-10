import NextLink from 'next/link';
import { HStack, Divider, Show, VStack, Button } from '@chakra-ui/react';
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
        <VStack spacing={2} pt={4} px={2} w="full" align="flex-start">
          <NextLink href="/settings" passHref>
            <Button
              mx={4}
              height={8}
              leftIcon={<IoReturnUpBack />}
              variant="link"
            >
              Go back
            </Button>
          </NextLink>
          {children}
        </VStack>
      </Show>
    </HStack>
  );
};
