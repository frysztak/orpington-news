import React, { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { Box, CircularProgress, VStack } from '@chakra-ui/react';
import { useApi, useHandleError, getItemDetails } from '@api';
import { ArticleContent, ArticleHeader } from '@components/article';

export interface ArticleProps {
  collectionSlug?: string;
  itemSlug?: string;

  onGoBackClicked?: () => void;
}

export const Article: React.FC<ArticleProps> = (props) => {
  const { collectionSlug, itemSlug, onGoBackClicked } = props;

  const api = useApi();
  const { onError } = useHandleError();

  const query = useQuery(
    ['itemDetails', { collectionSlug, itemSlug }],
    () => getItemDetails(api, collectionSlug!, itemSlug!),
    { enabled: Boolean(collectionSlug) && Boolean(itemSlug), onError }
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
      <ArticleHeader article={query.data} onGoBackClicked={onGoBackClicked} />
      <Box w="full" px={4} py={4}>
        <ArticleContent html={query.data.fullText} />
      </Box>
    </VStack>
  ) : null;
};
