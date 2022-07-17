import React, { useCallback } from 'react';
import {
  Box,
  Icon,
  Divider,
  Heading,
  HStack,
  IconButton,
  Text,
  Link,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuOptionGroup,
  MenuItemOption,
  MenuDivider,
} from '@chakra-ui/react';
import {
  ArticleWidth,
  CollectionItemDetails,
  defaultArticleWidth,
} from '@orpington-news/shared';
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';
import { CgCalendar } from '@react-icons/all-files/cg/CgCalendar';
import { CgTime } from '@react-icons/all-files/cg/CgTime';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { IoCheckmarkDone } from '@react-icons/all-files/io5/IoCheckmarkDone';
import { format, fromUnixTime } from 'date-fns';

export type ArticleMenuAction = 'markAsUnread';

export interface ArticleHeaderProps {
  article: CollectionItemDetails;
  articleWidth?: ArticleWidth;

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
    },
    articleWidth,

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

  return (
    <>
      <HStack w="full" justify="flex-end">
        <IconButton
          icon={<IoReturnUpBack />}
          aria-label="Go back to collection"
          variant="ghost"
          mr="auto"
          onClick={onGoBackClicked}
          display={{ base: 'inline-flex', lg: 'none' }}
        />

        <IconButton
          icon={<HiOutlineExternalLink />}
          as={Link}
          isExternal
          href={url}
          aria-label="Open external link"
          variant="ghost"
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
            <MenuButton
              as={IconButton}
              aria-label="Menu"
              icon={<BsThreeDotsVertical />}
              variant="ghost"
              tabIndex={0}
            />
            <MenuList data-focus-visible-disabled>
              <MenuItem
                icon={<IoCheckmarkDone />}
                onClick={handleMenuItemClick('markAsUnread')}
                isDisabled={!dateRead}
              >
                Mark as unread
              </MenuItem>

              <Box display={{ base: 'none', lg: 'block' }}>
                <MenuDivider />
                <MenuOptionGroup
                  title="Article width"
                  type="radio"
                  defaultValue="narrow"
                  value={articleWidth ?? defaultArticleWidth}
                  /**
                   * `onChange` expects handler to accept `string | string[]`, but since
                   * group type is `radio`, it can't call `onChange` with an array
                   */
                  onChange={onArticleWidthChanged as any}
                >
                  <MenuItemOption value="narrow">Narrow</MenuItemOption>
                  <MenuItemOption value="wide">Wide</MenuItemOption>
                  <MenuItemOption value="unlimited">Unlimited</MenuItemOption>
                </MenuOptionGroup>
              </Box>
            </MenuList>
          </Menu>
        </Box>
      </HStack>

      <VStack w="full" align="flex-start" spacing={1} px={4}>
        <Heading overflowWrap="anywhere">{title}</Heading>
        <Box>
          <Text color="gray.500" as={HStack}>
            <Icon as={CgCalendar} mr={1} />
            <>
              published on{' '}
              {format(fromUnixTime(datePublished), 'dd/MM/yyyy (EEE)')}
            </>
          </Text>
          <Text color="gray.500" as={HStack}>
            <Icon as={CgTime} mr={1} />
            <>estimated reading time {Math.ceil(readingTime)} minutes</>
          </Text>
        </Box>

        <Divider pt={3} />
      </VStack>
    </>
  );
};
