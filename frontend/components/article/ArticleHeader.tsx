import React, { useCallback, useMemo } from 'react';
import { Icon, IconButton } from '@chakra-ui/react';
import { ArticleWidth, CollectionItem, defaultArticleWidth } from '@shared';
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { IoChevronBack } from '@react-icons/all-files/io5/IoChevronBack';
import { IoChevronForward } from '@react-icons/all-files/io5/IoChevronForward';
import {
  NewspaperIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Icon as IconifyIcon } from '@iconify/react';
import radioboxBlank from '@iconify/icons-mdi/radiobox-blank';
import { format, fromUnixTime } from 'date-fns';
import cx from 'classnames';
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
import type { AdjacentArticle } from '@features/Article/queries';

export type ArticleMenuAction = 'markAsUnread';

export interface ArticleHeaderProps {
  article: CollectionItem;
  articleWidth?: ArticleWidth;

  disableActionButtons?: boolean;
  mobileLayout?: boolean;
  hideAdjacentArticlesButtons?: boolean;
  nextArticle?: AdjacentArticle;
  previousArticle?: AdjacentArticle;
  onGoBackClicked?: () => void;
  onReadingListToggle?: () => void;
  onMenuItemClicked?: (action: ArticleMenuAction) => void;
  onArticleWidthChanged?: (width: ArticleWidth) => void;
  onPreviousArticleClicked?: () => void;
  onNextArticleClicked?: () => void;
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
    mobileLayout,
    hideAdjacentArticlesButtons,
    nextArticle,
    previousArticle,
    onGoBackClicked,
    onReadingListToggle,
    onMenuItemClicked,
    onArticleWidthChanged,
    onPreviousArticleClicked,
    onNextArticleClicked,
  } = props;

  const handleMenuItemClick = useCallback(
    (action: ArticleMenuAction) => () => {
      onMenuItemClicked?.(action);
    },
    [onMenuItemClicked]
  );

  const actions = useMemo(
    () => (
      <div className="flex flex-row">
        <div>
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
              <MenuItem icon={<HiOutlineExternalLink />}>
                <a href={url} target="_blank">
                  Open in browser
                </a>
              </MenuItem>

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
        </div>
      </div>
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
      <div
        className={cx('flex flex-row justify-between w-full px-1 pt-1', {
          'lg:hidden': !mobileLayout,
        })}
      >
        <IconButton
          icon={<IoReturnUpBack />}
          aria-label="Go back to collection"
          variant="ghost"
          onClick={onGoBackClicked}
          isDisabled={disableActionButtons}
          data-test="goBack"
        />

        {!hideAdjacentArticlesButtons && (
          <div>
            <IconButton
              icon={<IoChevronBack />}
              aria-label="Previous Article"
              variant="ghost"
              mr="auto"
              onClick={onPreviousArticleClicked}
              isDisabled={disableActionButtons || previousArticle === undefined}
              data-test="prevArticle"
            />

            <IconButton
              icon={<IoChevronForward />}
              aria-label="Next Article"
              variant="ghost"
              mr="auto"
              onClick={onNextArticleClicked}
              isDisabled={disableActionButtons || nextArticle === undefined}
              data-test="nextArticle"
            />
          </div>
        )}

        {actions}
      </div>

      <div className="flex flex-col w-full items-start gap-1 px-4 pt-4">
        <div className="flex flex-row h-full w-full justify-between items-stretch">
          <div className="flex items-center">
            <h2
              className="[overflow-wrap:anywhere] font-article text-articleHeader font-bold leading-snug"
              data-test="articleHeader"
            >
              {title}
            </h2>
          </div>

          <div
            className={cx('h-full items-center hidden', {
              'lg:flex': !mobileLayout,
            })}
          >
            {actions}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-gray-500 font-article text-article">
          <div className="flex items-center">
            <Icon as={NewspaperIcon} mr={1} />
            <span title="Collection">{collectionTitle}</span>
          </div>

          <div className="flex items-center">
            <Icon as={CalendarDaysIcon} mr={1} />
            <span title="Published on">
              {format(fromUnixTime(datePublished), 'dd/MM/yyyy')}
            </span>
          </div>

          <div className="flex items-center">
            <Icon as={ClockIcon} mr={1} />
            <span title="Estimated reading time">
              {Math.ceil(readingTime)}m
            </span>
          </div>
        </div>

        <hr className="divider" />
      </div>
    </>
  );
};
