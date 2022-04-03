import { useState } from 'react';
import { useInterval } from 'usehooks-ts';
import { formatDistanceToNowStrict } from 'date-fns';
import Head from 'next/head';
import { Heading, Text, HStack, VStack, Code } from '@chakra-ui/react';
import { commonGetServerSideProps } from '@pages/ssrProps';
import type { NextPageWithLayout } from '@pages/types';
import { useEventListenerContext } from '@features/EventListener';
import { SettingsLayout } from './SettingsLayout';

const formatLastPingText = (lastPing: number | null): string => {
  if (lastPing === null) {
    return 'N/A';
  }
  return formatDistanceToNowStrict(lastPing, { addSuffix: true });
};

const Page: NextPageWithLayout = () => {
  const { status, lastPing } = useEventListenerContext();

  const [lastPingText, setLastPingText] = useState<string>(
    formatLastPingText(lastPing)
  );

  useInterval(() => {
    setLastPingText(formatLastPingText(lastPing));
  }, 500);

  return (
    <>
      <Head>
        <title>Customize appearance</title>
      </Head>

      <VStack w="full" align="flex-start" p={4} spacing={4}>
        <Heading fontSize="2xl">About Orpington News</Heading>

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
            <Code>{process.env.NEXT_PUBLIC_GIT_COMMIT_HASH}</Code>
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
            <Text>Last ping:</Text>
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

export const getServerSideProps = commonGetServerSideProps;
