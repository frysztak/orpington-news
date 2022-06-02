import { useState } from 'react';
import { useContextSelector } from 'use-context-selector';
import { useInterval } from 'usehooks-ts';
import { formatDistanceToNowStrict } from 'date-fns';
import Head from 'next/head';
import { Heading, Text, HStack, VStack, Code, Box } from '@chakra-ui/react';
import { getSSProps } from '@pages/ssrProps';
import type { NextPageWithLayout } from '@pages/types';
import { EventListenerContext } from '@features/EventListener';
import { SettingsLayout } from './SettingsLayout';

const formatLastPingText = (lastPing: number | null): string => {
  if (lastPing === null) {
    return 'N/A';
  }
  return formatDistanceToNowStrict(lastPing, { addSuffix: true });
};

const Page: NextPageWithLayout = () => {
  const status = useContextSelector(EventListenerContext, (ctx) => ctx.status);
  const lastPing = useContextSelector(
    EventListenerContext,
    (ctx) => ctx.lastPing
  );

  const [lastPingText, setLastPingText] = useState<string>(
    formatLastPingText(lastPing)
  );

  useInterval(() => {
    setLastPingText(formatLastPingText(lastPing));
  }, 500);

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
            SSE
          </Heading>
          <HStack>
            <Text>Status:</Text>
            <Code>{status}</Code>
          </HStack>
          <HStack>
            <Text>Last message:</Text>
            <Code>{lastPingText}</Code>
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

export const getServerSideProps = getSSProps({});
