import { useContextSelector } from 'use-context-selector';
import Head from 'next/head';
import { Heading, Text, HStack, VStack, Code, Box } from '@chakra-ui/react';
import type { NextPageWithLayout } from '@pages/types';
import { EventListenerContext } from '@features/EventListener';
import { SettingsLayout } from './SettingsLayout';
import { ReadyState } from 'react-use-websocket';

const connectionStatuLabel = {
  [ReadyState.CONNECTING]: 'Connecting',
  [ReadyState.OPEN]: 'Open',
  [ReadyState.CLOSING]: 'Closing',
  [ReadyState.CLOSED]: 'Closed',
  [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
};

const Page: NextPageWithLayout = () => {
  const status = useContextSelector(EventListenerContext, (ctx) => ctx.status);

  return (
    <>
      <Head>
        <title>About</title>
      </Head>

      <VStack w="full" align="flex-start" p={4} spacing={4}>
        <Box as="h2" textStyle="settings.header">
          About Orpington News
        </Box>

        <section>
          <Heading as="h3" fontSize="xl">
            Build
          </Heading>
          <HStack>
            <Text>Version:</Text>
            <Code>{process.env.NEXT_PUBLIC_VERSION}</Code>
          </HStack>

          <HStack>
            <Text>Git commit:</Text>
            <Code>{process.env.NEXT_PUBLIC_GIT_COMMIT_HASH?.slice(0, 8)}</Code>
          </HStack>
        </section>

        <section>
          <Heading as="h3" fontSize="xl">
            WebSocket
          </Heading>
          <HStack>
            <Text>Status:</Text>
            <Code>{connectionStatuLabel[status]}</Code>
          </HStack>
        </section>
      </VStack>
    </>
  );
};

Page.getLayout = (page) => {
  return <SettingsLayout>{page}</SettingsLayout>;
};

export default Page;
