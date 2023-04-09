import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Text, Icon, useToast, VStack } from '@chakra-ui/react';
import { getUnixTime } from 'date-fns';
import { useLocalStorage } from 'usehooks-ts';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { useRouter } from 'next/router';
import { RiErrorWarningFill } from '@react-icons/all-files/ri/RiErrorWarningFill';
import {
  ArticleContent,
  ArticleHeader,
  ArticleMenuAction,
  ArticleSkeleton,
} from '@components/article';
import { useIsTouchscreen } from '@utils';
import {
  ArticleFontFamiliesNames,
  ArticleFontSizeValues,
  ArticleMonoFontFamiliesNames,
  ArticleWidth,
  defaultArticleFontFamily,
  defaultArticleFontSize,
  defaultArticleMonoFontFamily,
  defaultArticleWidth,
  ID,
} from '@shared';
import { useArticleDateReadMutation, useArticleDetails } from './queries';

export interface ArticleProps {
  collectionId?: ID;
  itemId?: ID;
  isRouterReady?: boolean;
  fullHeight?: boolean;
  showGoBackButtonForDesktop?: boolean;

  onGoBackClicked?: () => void;
}

const getWidth = (setting: ArticleWidth): string => {
  switch (setting) {
    case 'narrow':
      return '42em';
    case 'wide':
      return '64em';
    case 'unlimited':
      return 'unset';
  }
};

export const Article: React.FC<ArticleProps> = (props) => {
  const {
    collectionId,
    itemId,
    isRouterReady,
    fullHeight = true,
    showGoBackButtonForDesktop = false,
    onGoBackClicked,
  } = props;

  const router = useRouter();
  const toast = useToast();
  const { mutate: mutateDateRead } = useArticleDateReadMutation(
    collectionId,
    itemId
  );

  useEffect(() => {
    setBlockDateReadMutation(false);
  }, [itemId]);

  const [blockDateReadMutation, setBlockDateReadMutation] = useState(false);
  const query = useArticleDetails(collectionId, itemId, {
    onSuccess: ({ dateRead }) => {
      if (blockDateReadMutation) {
        return;
      }

      if (!dateRead) {
        Boolean(collectionId) &&
          Boolean(itemId) &&
          mutateDateRead(
            {
              collectionId: collectionId!,
              itemId: itemId!,
              dateRead: getUnixTime(new Date()),
            },
            {
              onSuccess: () => {
                setBlockDateReadMutation(true);
              },
            }
          );
      } else {
        setBlockDateReadMutation(true);
      }
    },
  });

  const handleMenuItemClicked = useCallback(
    (action: ArticleMenuAction) => {
      if (action === 'markAsUnread') {
        Boolean(collectionId) &&
          Boolean(itemId) &&
          mutateDateRead(
            {
              collectionId: collectionId!,
              itemId: itemId!,
              dateRead: null,
            },
            {
              onSuccess: () => {
                setBlockDateReadMutation(true);
                toast({
                  status: 'success',
                  description: 'Article marked as unread!',
                });
              },
            }
          );
      }
    },
    [collectionId, itemId, mutateDateRead, toast]
  );

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [itemId]);

  const [articleWidth, setArticleWidth] = useLocalStorage(
    'articleWidth',
    defaultArticleWidth
  );
  const [articleFontSize] = useLocalStorage(
    'articleFontSize',
    defaultArticleFontSize
  );
  const [articleFontFamily] = useLocalStorage(
    'articleFontFamily',
    defaultArticleFontFamily
  );
  const [articleMonoFontFamily] = useLocalStorage(
    'articleMonoFontFamily',
    defaultArticleMonoFontFamily
  );

  const isTouchscreen = useIsTouchscreen();

  const allowDragToNextArticle =
    query.status === 'success' && Boolean(query.data.nextId);
  const allowDragToPrevArticle =
    query.status === 'success' && Boolean(query.data.previousId);

  const x = useMotionValue(0);
  const finishedDrag = useRef(false);
  const handleDrag = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (finishedDrag.current) {
        return;
      }

      const offset = info.offset.x;
      if (query.status !== 'success') {
        return;
      }

      const { previousId, nextId } = query.data;
      const threshold = 0.35 * window.innerWidth;

      if (offset < -threshold && nextId) {
        router.push(`/collection/${collectionId}/article/${nextId}`);
        finishedDrag.current = true;
      } else if (offset > threshold && previousId) {
        router.push(`/collection/${collectionId}/article/${previousId}`);
        finishedDrag.current = true;
      }
    },
    [collectionId, query.data, query.status, router]
  );

  const handleDragEnd = useCallback(() => {
    if (!finishedDrag.current) {
      x.stop();
      x.set(0);
    }
  }, [x]);

  return (
    <VStack
      flexGrow={1}
      overflow="auto"
      overflowX="hidden"
      h={fullHeight ? '100vh' : undefined}
      w="full"
      spacing={1}
      ref={ref}
      maxWidth={getWidth(articleWidth)}
    >
      <motion.div
        drag={isTouchscreen ? 'x' : false}
        dragConstraints={{
          left: allowDragToNextArticle ? undefined : 0,
          right: allowDragToPrevArticle ? undefined : 0,
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x, width: '100%', height: '100%' }}
      >
        {!isRouterReady || query.isLoading ? (
          <ArticleSkeleton />
        ) : query.status === 'error' ? (
          <VStack spacing={6} h="full" w="full" justify="center">
            <Icon as={RiErrorWarningFill} w={12} h="auto" fill="red.300" />
            <Text fontSize="xl" fontWeight="bold">
              {query.error.status === 404
                ? 'Article not found.'
                : 'Unexpected error'}
            </Text>
          </VStack>
        ) : (
          query.status === 'success' && (
            <Box
              sx={{
                '--article-font-size-scale': `${ArticleFontSizeValues[articleFontSize]}`,
                '--article-font-family':
                  ArticleFontFamiliesNames[articleFontFamily],
                '--article-mono-font-family':
                  ArticleMonoFontFamiliesNames[articleMonoFontFamily],
              }}
            >
              <ArticleHeader
                article={query.data}
                onGoBackClicked={onGoBackClicked}
                onMenuItemClicked={handleMenuItemClicked}
                articleWidth={articleWidth}
                onArticleWidthChanged={setArticleWidth}
                showGoBackButtonForDesktop={showGoBackButtonForDesktop}
              />
              <Box w="full" px={4} py={4}>
                <ArticleContent html={query.data.fullText} />
              </Box>
            </Box>
          )
        )}
      </motion.div>
    </VStack>
  );
};
