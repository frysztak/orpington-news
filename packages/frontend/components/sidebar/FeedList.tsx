import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, MenuDivider, MenuItem, VStack } from '@chakra-ui/react';
import { CgRemove } from 'react-icons/cg';
import { IoCheckmarkDone, IoRefresh } from 'react-icons/io5';
import { AiTwotoneEdit } from 'react-icons/ai';
import { SidebarItem } from './SidebarItem';
import { FeedIconType, getFeedIcon } from './FeedIcon';

type ID = string;

export interface Feed {
  id: ID;
  label: string;
  unreadCount: number;
  icon?: FeedIconType;
  children?: Feed[];
}

export type FeedMenuAction = 'markAsRead' | 'refresh' | 'edit' | 'delete';

export interface CollapsibleFeedListProps {
  feed: Feed;
  activeFeedId?: ID;
  expandedFeedIDs?: Array<ID>;

  onFeedClicked: (feed: Feed) => void;
  onChevronClicked: (feed: Feed) => void;
  onFeedMenuActionClicked?: (feed: Feed, action: FeedMenuAction) => void;
}

const CollapsibleFeedList: React.FC<CollapsibleFeedListProps> = (props) => {
  const {
    feed,
    activeFeedId,
    expandedFeedIDs,
    onFeedClicked,
    onChevronClicked,
    onFeedMenuActionClicked,
  } = props;
  const { id, label, unreadCount, children } = feed;

  const hasChildren = Boolean(children) && children?.length !== 0;
  const isOpen = expandedFeedIDs?.includes(id) ?? false;

  const handleChevronClick = (feed: Feed) => () => onChevronClicked(feed);
  const handleClick = () => onFeedClicked(feed);

  const icon = useMemo(() => getFeedIcon(feed.icon), [feed.icon]);

  const handleMenuItemClick = useCallback(
    (action: FeedMenuAction) => () => {
      onFeedMenuActionClicked?.(feed, action);
    },
    [feed, onFeedMenuActionClicked]
  );

  return (
    <>
      <SidebarItem
        title={label}
        isActive={activeFeedId === id}
        icon={icon}
        counter={unreadCount}
        chevron={hasChildren ? (isOpen ? 'bottom' : 'top') : undefined}
        onClick={handleClick}
        onChevronClick={handleChevronClick(feed)}
        menuItems={
          <>
            <MenuItem
              icon={<IoCheckmarkDone />}
              onClick={handleMenuItemClick('markAsRead')}
            >
              Mark as read
            </MenuItem>
            <MenuItem
              icon={<IoRefresh />}
              onClick={handleMenuItemClick('refresh')}
            >
              Refresh
            </MenuItem>
            <MenuItem
              icon={<AiTwotoneEdit />}
              onClick={handleMenuItemClick('edit')}
            >
              Edit
            </MenuItem>
            <MenuDivider />
            <MenuItem
              icon={<CgRemove />}
              onClick={handleMenuItemClick('delete')}
            >
              Delete
            </MenuItem>
          </>
        }
      />
      <Box pl={4} w="full">
        {isOpen &&
          children?.map((feed: Feed) => (
            <CollapsibleFeedList
              key={feed.id}
              feed={feed}
              activeFeedId={activeFeedId}
              expandedFeedIDs={expandedFeedIDs}
              onFeedClicked={onFeedClicked}
              onChevronClicked={handleChevronClick(feed)}
              onFeedMenuActionClicked={onFeedMenuActionClicked}
            />
          ))}
      </Box>
    </>
  );
};

export interface FeedListProps {
  feeds: Feed[];
  activeFeedId?: ID;
  expandedFeedIDs?: Array<ID>;

  onFeedClicked: (feed: Feed) => void;
  onChevronClicked: (feed: Feed) => void;
  onFeedMenuActionClicked?: (feed: Feed, action: FeedMenuAction) => void;
}

export const FeedList: React.FC<FeedListProps> = (props) => {
  const {
    feeds,
    activeFeedId,
    expandedFeedIDs,
    onFeedClicked,
    onChevronClicked,
    onFeedMenuActionClicked,
  } = props;

  return (
    <VStack w="full" spacing={1}>
      {feeds.map((feed: Feed) => (
        <CollapsibleFeedList
          key={feed.id}
          feed={feed}
          activeFeedId={activeFeedId}
          expandedFeedIDs={expandedFeedIDs}
          onFeedClicked={onFeedClicked}
          onChevronClicked={onChevronClicked}
          onFeedMenuActionClicked={onFeedMenuActionClicked}
        />
      ))}
    </VStack>
  );
};

const useExpandedFeeds = (initialExpandedFeedIDs?: Array<ID>) => {
  const [expandedFeedIDs, setExpandedFeedIDs] = useState(
    initialExpandedFeedIDs || []
  );

  const onToggleFeed = useCallback((feed: Feed) => {
    setExpandedFeedIDs((feeds) => {
      const idx = feeds.findIndex((id) => id === feed.id);
      return idx !== -1
        ? [...feeds.slice(0, idx), ...feeds.slice(idx + 1)]
        : [...feeds, feed.id];
    });
  }, []);

  return { expandedFeedIDs, onToggleFeed };
};

const useActiveFeed = (initialActiveFeedId?: ID) => {
  const [activeFeedId, setActiveFeedID] = useState(initialActiveFeedId);

  const onClickFeed = useCallback((feed: Feed) => {
    setActiveFeedID(feed.id);
  }, []);

  return { activeFeedId, onClickFeed };
};
