import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  CircularProgress,
  Heading,
  Icon,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { getUnixTime } from 'date-fns';
import { BiMessageAltError } from '@react-icons/all-files/bi/BiMessageAltError';
import {
  ArticleContent,
  ArticleHeader,
  ArticleMenuAction,
} from '@components/article';
import type { ID } from '@orpington-news/shared';
import { useArticleDateReadMutation, useArticleDetails } from './queries';

export interface ArticleProps {
  collectionId: ID;
  itemId: ID;

  onGoBackClicked?: () => void;
}

export const Article: React.FC<ArticleProps> = (props) => {
  const { collectionId, itemId, onGoBackClicked } = props;

  const toast = useToast();

  const [forceUnread, setForceUnread] = useState(false);
  useEffect(() => {
    setForceUnread(false);
  }, [itemId]);
  const { mutate: mutateDateRead } = useArticleDateReadMutation(
    collectionId,
    itemId
  );

  const query = useArticleDetails(collectionId, itemId);

  useEffect(() => {
    if (!query.data?.id) {
      return;
    }

    mutateDateRead(
      {
        collectionId,
        itemId: query.data.id,
        dateRead: forceUnread ? null : getUnixTime(new Date()),
      },
      {
        onSuccess: () => {
          if (!forceUnread) {
            return;
          }
          toast({
            status: 'success',
            description: 'Article marked as unread!',
          });
        },
      }
    );
  }, [query.data?.id, toast, mutateDateRead, collectionId, forceUnread]);

  const handleMenuItemClicked = useCallback((action: ArticleMenuAction) => {
    if (action === 'markAsUnread') {
      setForceUnread(true);
    }
  }, []);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [query.data?.fullText]);

  if (query.status === 'error') {
    const status: number | undefined = query.error?.status;
    return (
      <VStack spacing={6} h="full" w="full" justify="center">
        <Icon as={BiMessageAltError} w={16} h="auto" />
        <Heading>
          {status === 404 ? 'Article not found.' : 'Unexpected error'}
        </Heading>
      </VStack>
    );
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
