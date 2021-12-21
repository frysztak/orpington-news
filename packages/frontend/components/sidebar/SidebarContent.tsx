import React, { useCallback } from 'react';
import {
  Box,
  Divider,
  Heading,
  HStack,
  Icon,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { AiOutlineHome } from 'react-icons/ai';
import { BsBookmarks } from 'react-icons/bs';
import { RiAddBoxFill, RiSettingsLine } from 'react-icons/ri';
import { CgReorder } from 'react-icons/cg';
import { SidebarItem } from './SidebarItem';
import { FeedList, FeedListProps } from './FeedList';
import { SiRss } from 'react-icons/si';

type MenuItem = 'home' | 'readingList' | 'addFeed' | 'organize' | 'settings';

export type SidebarContentProps = FeedListProps & {
  onMenuItemClicked: (menuAction: MenuItem) => void;
};

export const SidebarContent: React.FC<SidebarContentProps> = (props) => {
  const { onMenuItemClicked, ...feedListProps } = props;
  const { activeFeedId } = feedListProps;

  const handleClick = useCallback(
    (menuAction: MenuItem) => () => {
      onMenuItemClicked?.(menuAction);
    },
    [onMenuItemClicked]
  );

  const fg = useColorModeValue('purple.700', 'white');

  return (
    <VStack w="full" h="full" align="flex-start">
      <HStack p={6} spacing={[4, 6]}>
        <Icon as={SiRss} color={fg} w={[8, 10]} h="auto" />
        <Heading fontWeight={700} color={fg} as="h1" fontSize={['2xl', '4xl']}>
          Orpington News
        </Heading>
      </HStack>

      <SidebarItem
        title="Home"
        icon={AiOutlineHome}
        isActive={activeFeedId === 'home'}
        onClick={handleClick('home')}
      />

      <SidebarItem
        title="Reading List"
        icon={BsBookmarks}
        isActive={activeFeedId === 'readingList'}
        onClick={handleClick('readingList')}
      />

      <SidebarItem
        title="Add Feed"
        icon={RiAddBoxFill}
        isActive={false}
        onClick={handleClick('addFeed')}
      />

      <Divider />

      {feedListProps && (
        <FeedList {...feedListProps} activeFeedId={activeFeedId} />
      )}

      <Box w="full" style={{ marginTop: 'auto' }} pb={6}>
        <SidebarItem
          title="Organize"
          icon={CgReorder}
          isActive={activeFeedId === 'organize'}
          onClick={handleClick('organize')}
        />
        <SidebarItem
          title="Settings"
          icon={RiSettingsLine}
          isActive={activeFeedId === 'settings'}
          onClick={handleClick('settings')}
        />
      </Box>
    </VStack>
  );
};
