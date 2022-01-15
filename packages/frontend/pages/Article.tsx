import React, { useCallback, useEffect, useRef } from 'react';
import { Box, CircularProgress, VStack } from '@chakra-ui/react';
import { getUnixTime } from 'date-fns';
import {
  ArticleContent,
  ArticleHeader,
  ArticleMenuAction,
} from '@components/article';
import {
  useArticleDateReadMutation,
  useArticleDetails,
} from '@features/Article';

export interface ArticleProps {
  collectionSlug: string;
  itemSlug: string;

  onGoBackClicked?: () => void;
}

export const Article: React.FC<ArticleProps> = (props) => {
  const { collectionSlug, itemSlug, onGoBackClicked } = props;

  const { mutate: mutateDateRead } = useArticleDateReadMutation(
    collectionSlug,
    itemSlug
  );

  const query = useArticleDetails(collectionSlug, itemSlug);

  useEffect(() => {
    if (query.data?.id) {
      mutateDateRead({ id: query.data.id, dateRead: getUnixTime(new Date()) });
    }
  }, [query.data?.id, mutateDateRead]);

  const handleMenuItemClicked = useCallback(
    (action: ArticleMenuAction) => {
      if (action === 'markAsUnread') {
        if (query.data?.id) {
          mutateDateRead({
            id: query.data.id,
            dateRead: null,
          });
        }
      }
    },
    [mutateDateRead, query.data?.id]
  );

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [query.data?.fullText]);

  if (query.status === 'idle') {
    return null;
  }

  return query.status === 'loading' ? (
    <CircularProgress isIndeterminate />
  ) : query.status === 'success' ? (
    <VStack maxH="100vh" overflowY="auto" w="full" spacing={1} ref={ref}>
      <ArticleHeader
        article={query.data}
        onGoBackClicked={onGoBackClicked}
        onMenuItemClicked={handleMenuItemClicked}
      />
      <Box w="full" px={4} py={4}>
        <ArticleContent html={query.data.fullText} />
      </Box>
    </VStack>
  ) : null;
};
