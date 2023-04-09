import React, { useCallback, useMemo } from 'react';
import {
  Box,
  Icon,
  Divider,
  Heading,
  HStack,
  IconButton,
  Link,
  VStack,
  Wrap,
  WrapItem,
  Flex,
} from '@chakra-ui/react';
import { ArticleWidth, CollectionItem, defaultArticleWidth } from '@shared';
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import {
  NewspaperIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Icon as IconifyIcon } from '@iconify/react';
import radioboxBlank from '@iconify/icons-mdi/radiobox-blank';
import { format, fromUnixTime } from 'date-fns';
import {
  Menu,
  MenuContent,
  MenuDivider,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '@components/menu';

export type ArticleMenuAction = 'markAsUnread';

export interface ArticleHeaderProps {
  article: CollectionItem;
  articleWidth?: ArticleWidth;

  disableActionButtons?: boolean;
  showGoBackButtonForDesktop?: boolean;
  onGoBackClicked?: () => void;
  onReadingListToggle?: () => void;
  onMenuItemClicked?: (action: ArticleMenuAction) => void;
  onArticleWidthChanged?: (width: ArticleWidth) => void;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = (props) => {
  const {
    article: {
      title,
      url,
      datePublished,
      dateRead,
      readingTime,
      onReadingList,
      collection: { title: collectionTitle },
    },
    articleWidth,

    disableActionButtons,
    showGoBackButtonForDesktop,
    onGoBackClicked,
    onReadingListToggle,
    onMenuItemClicked,
    onArticleWidthChanged,
  } = props;

  const handleMenuItemClick = useCallback(
    (action: ArticleMenuAction) => () => {
      onMenuItemClicked?.(action);
    },
    [onMenuItemClicked]
  );

  const actions = useMemo(
    () => (
      <HStack>
        <IconButton
          icon={<HiOutlineExternalLink />}
          as={Link}
          isExternal
          href={url}
          aria-label="Open external link"
          variant="ghost"
          isDisabled={disableActionButtons}
        />
        {/*<IconButton
          icon={onReadingList ? <BsBookmarkDash /> : <BsBookmarkPlus />}
          aria-label={
            onReadingList ? 'Remove from reading list' : 'Add to reading list'
          }
          variant="ghost"
          onClick={onReadingListToggle}
        />*/}

        <Box>
          <Menu>
            <MenuTrigger asChild>
              <IconButton
                aria-label="Menu"
                icon={<BsThreeDotsVertical />}
                variant="ghost"
                tabIndex={0}
                isDisabled={disableActionButtons}
              />
            </MenuTrigger>
            <MenuContent>
              <MenuItem
                icon={<IconifyIcon icon={radioboxBlank} />}
                onClick={handleMenuItemClick('markAsUnread')}
                disabled={!dateRead}
              >
                Mark as unread
              </MenuItem>

              <div className="hidden lg:block">
                <MenuDivider />
                <MenuLabel>Article width</MenuLabel>
                <MenuRadioGroup
                  defaultValue="narrow"
                  value={articleWidth ?? defaultArticleWidth}
                  onValueChange={onArticleWidthChanged as any}
                >
                  <MenuRadioItem value="narrow">Narrow</MenuRadioItem>
                  <MenuRadioItem value="wide">Wide</MenuRadioItem>
                  <MenuRadioItem value="unlimited">Unlimited</MenuRadioItem>
                </MenuRadioGroup>
              </div>
            </MenuContent>
          </Menu>
        </Box>
      </HStack>
    ),
    [
      articleWidth,
      dateRead,
      disableActionButtons,
      handleMenuItemClick,
      onArticleWidthChanged,
      url,
    ]
  );

  return (
    <>
      <HStack
        w="full"
        justify="space-between"
        display={{ base: 'flex', lg: 'none' }}
      >
        <IconButton
          icon={<IoReturnUpBack />}
          aria-label="Go back to collection"
          variant="ghost"
          mr="auto"
          onClick={onGoBackClicked}
          isDisabled={disableActionButtons}
          data-test="goBack"
        />

        {actions}
      </HStack>

      <VStack w="full" align="flex-start" spacing={1} px={4} pt={4}>
        <HStack h="full" w="full" justify="space-between" align="stretch">
          <Flex align="center">
            {showGoBackButtonForDesktop && (
              <IconButton
                display={{ base: 'none', lg: 'flex' }}
                icon={<IoReturnUpBack />}
                aria-label="Go back to collection"
                variant="ghost"
                onClick={onGoBackClicked}
                isDisabled={disableActionButtons}
                data-test="goBack"
                mr={2}
              />
            )}
            <Heading
              overflowWrap="anywhere"
              fontFamily="var(--article-font-family)"
              fontSize="calc(var(--chakra-fontSizes-3xl) * var(--article-font-size-scale, 1))"
              data-test="articleHeader"
            >
              {title}
            </Heading>
          </Flex>

          <Flex h="full" align="center" display={{ base: 'none', lg: 'flex' }}>
            {actions}
          </Flex>
        </HStack>

        <Wrap
          color="gray.500"
          fontFamily="var(--article-font-family)"
          fontSize="calc(1rem * var(--article-font-size-scale, 1))"
        >
          <WrapItem display="flex" alignItems="center">
            <Icon as={NewspaperIcon} mr={1} />
            <span title="Collection">{collectionTitle}</span>
          </WrapItem>

          <WrapItem display="flex" alignItems="center">
            <Icon as={CalendarDaysIcon} mr={1} />
            <span title="Published on">
              {format(fromUnixTime(datePublished), 'dd/MM/yyyy')}
            </span>
          </WrapItem>

          <WrapItem display="flex" alignItems="center">
            <Icon as={ClockIcon} mr={1} />
            <span title="Estimated reading time">
              {Math.ceil(readingTime)}m
            </span>
          </WrapItem>
        </Wrap>

        <Divider pt={3} />
      </VStack>
    </>
  );
};
