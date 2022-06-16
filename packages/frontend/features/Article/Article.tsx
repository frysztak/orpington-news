import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Text, Icon, useToast, VStack } from '@chakra-ui/react';
import { getUnixTime } from 'date-fns';
import { useLocalStorage } from 'usehooks-ts';
import { RiErrorWarningFill } from '@react-icons/all-files/ri/RiErrorWarningFill';
import {
  ArticleContent,
  ArticleHeader,
  ArticleMenuAction,
  ArticleSkeleton,
} from '@components/article';
import { ArticleWidth, defaultArticleWidth, ID } from '@orpington-news/shared';
import { useArticleDateReadMutation, useArticleDetails } from './queries';

export interface ArticleProps {
  collectionId: ID;
  itemId: ID;

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
  const { collectionId, itemId, onGoBackClicked } = props;

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
        mutateDateRead(
          {
            collectionId,
            itemId: itemId,
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
        mutateDateRead(
          {
            collectionId,
            itemId: itemId,
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

  return (
    <VStack
      flexGrow={1}
      overflow="auto"
      maxH="100vh"
      w="full"
      spacing={1}
      ref={ref}
      maxWidth={getWidth(articleWidth)}
    >
      {query.status === 'loading' ? (
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
          <>
            <ArticleHeader
              article={query.data}
              onGoBackClicked={onGoBackClicked}
              onMenuItemClicked={handleMenuItemClicked}
              articleWidth={articleWidth}
              onArticleWidthChanged={setArticleWidth}
            />
            <Box w="full" px={4} py={4}>
              <ArticleContent html={query.data.fullText} />
            </Box>
          </>
        )
      )}
    </VStack>
  );
};
