import React, { useEffect, useRef } from 'react';
import { useQuery } from 'react-query';
import { CircularProgress, VStack } from '@chakra-ui/react';
import { useApi, useHandleError, getItemDetails } from '@api';
import { ArticleContent, ArticleHeader } from '@components/article';

export interface ArticleProps {
  collectionSlug?: string;
  itemSlug?: string;
}

export const Article: React.FC<ArticleProps> = (props) => {
  const { collectionSlug, itemSlug } = props;

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
    <VStack maxH="100vh" overflowY="scroll" spacing={6} px={4} pb={4} ref={ref}>
      <ArticleHeader article={query.data} />
      <ArticleContent html={query.data.fullText} />
    </VStack>
  ) : null;
};
