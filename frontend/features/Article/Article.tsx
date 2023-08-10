import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, Icon, useToast, VStack } from '@chakra-ui/react';
import { getUnixTime } from 'date-fns';
import { useLocalStorage } from 'usehooks-ts';
import cx from 'classnames';
import { useHotkeys, useHotkeysContext } from 'react-hotkeys-hook';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RiErrorWarningFill } from '@react-icons/all-files/ri/RiErrorWarningFill';
import {
  ArticleContent,
  ArticleHeader,
  ArticleMenuAction,
  ArticleSkeleton,
} from '@components/article';
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
import { hotkeyScopeArticle } from '@features/HotKeys/scopes';
import {
  useAdjacentArticles,
  useArticleDateReadMutation,
  useArticleDetails,
} from './queries';

export interface ArticleProps {
  collectionId?: ID;
  itemId?: ID;
  isRouterReady?: boolean;
  fullHeight?: boolean;
  mobileLayout?: boolean;

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
    mobileLayout = false,
    onGoBackClicked,
  } = props;

  const { nextArticle, previousArticle } = useAdjacentArticles(itemId);

  const router = useRouter();
  const toast = useToast();
  const { mutate: mutateDateRead } = useArticleDateReadMutation(
    collectionId,
    itemId
  );
  const standaloneArticleMode =
    router.pathname === '/collection/[collectionId]/article/[itemId]';

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
                  isClosable: true,
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

  const handlePreviousArticleClicked = useCallback(() => {
    if (previousArticle === undefined) {
      return;
    }
    router.push(
      `/?collectionId=${previousArticle.collectionId}&itemId=${previousArticle.articleId}`,
      `/collection/${previousArticle.collectionId}/article/${previousArticle.articleId}`
    );
  }, [previousArticle, router]);

  const handleNextArticleClicked = useCallback(() => {
    if (nextArticle === undefined) {
      return;
    }

    router.push(
      `/?collectionId=${nextArticle.collectionId}&itemId=${nextArticle.articleId}`,
      `/collection/${nextArticle.collectionId}/article/${nextArticle.articleId}`
    );
  }, [nextArticle, router]);

  const handleCloseArticle = useCallback(() => {
    router.push('/');
  }, [router]);

  useHotkeys('j', handleNextArticleClicked, {
    scopes: [hotkeyScopeArticle],
  });
  useHotkeys('k', handlePreviousArticleClicked, {
    scopes: [hotkeyScopeArticle],
  });
  useHotkeys('Escape', handleCloseArticle, {
    scopes: [hotkeyScopeArticle],
  });
  useHotkeys(
    'o',
    () => {
      window.open(query.data.url, '_blank');
    },
    { scopes: [hotkeyScopeArticle] }
  );
  useHotkeys(
    'u',
    () => {
      handleMenuItemClicked('markAsUnread');
    },
    { scopes: [hotkeyScopeArticle] }
  );

  const { enableScope, disableScope } = useHotkeysContext();

  useEffect(() => {
    if (itemId !== undefined) {
      enableScope(hotkeyScopeArticle);
    }

    return () => {
      disableScope(hotkeyScopeArticle);
    };
  }, [disableScope, enableScope, itemId]);

  return (
    <div
      className={cx(
        'flex flex-grow flex-gap-1 w-full lg:m-2',
        'overflow-auto overflow-x-hidden'
      )}
      ref={ref}
      style={{
        maxWidth: getWidth(articleWidth),
        height: fullHeight ? 'calc(100vh - 1rem)' : undefined,
      }}
    >
      <div className="h-full w-full">
        {!isRouterReady || query.isLoading ? (
          <ArticleSkeleton />
        ) : query.status === 'error' ? (
          <VStack
            spacing={6}
            h="full"
            w="full"
            justify="center"
            data-test="fetchError"
          >
            <Icon as={RiErrorWarningFill} w={12} h="auto" fill="red.300" />
            <Text fontSize="xl" fontWeight="bold" data-test="fetchErrorText">
              {query.error.status === 404
                ? 'Article not found.'
                : 'Unexpected error'}
            </Text>
            <Link href="/" className="underline">
              Home page
            </Link>
          </VStack>
        ) : (
          query.status === 'success' && (
            <div
              style={
                {
                  '--article-font-size-scale': `${ArticleFontSizeValues[articleFontSize]}`,
                  '--article-font-family':
                    ArticleFontFamiliesNames[articleFontFamily],
                  '--article-mono-font-family':
                    ArticleMonoFontFamiliesNames[articleMonoFontFamily],
                } as any
              }
            >
              <ArticleHeader
                article={query.data}
                onGoBackClicked={onGoBackClicked}
                onMenuItemClicked={handleMenuItemClicked}
                articleWidth={articleWidth}
                onArticleWidthChanged={setArticleWidth}
                mobileLayout={mobileLayout}
                hideAdjacentArticlesButtons={standaloneArticleMode}
                previousArticle={previousArticle}
                nextArticle={nextArticle}
                onPreviousArticleClicked={handlePreviousArticleClicked}
                onNextArticleClicked={handleNextArticleClicked}
              />
              <div className="w-full p-4">
                <ArticleContent html={query.data.fullText} />
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
