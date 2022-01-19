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
import { AiOutlineHome } from '@react-icons/all-files/ai/AiOutlineHome';
import { BsBookmarks } from '@react-icons/all-files/bs/BsBookmarks';
import { RiAddBoxFill } from '@react-icons/all-files/ri/RiAddBoxFill';
import { RiSettingsLine } from '@react-icons/all-files/ri/RiSettingsLine';
import { CgReorder } from '@react-icons/all-files/cg/CgReorder';
import RssIcon from '@heroicons/react/outline/RssIcon';
import { SidebarItem } from './SidebarItem';
import { Collections, CollectionsProps } from './Collections';

export type MenuItem =
  | 'home'
  | 'readingList'
  | 'addFeed'
  | 'organize'
  | 'settings';

export type SidebarContentProps = Omit<
  CollectionsProps,
  'activeCollectionId'
> & { activeCollectionId: string | number } & {
  onMenuItemClicked: (menuAction: MenuItem) => void;
};

export const SidebarContent: React.FC<SidebarContentProps> = (props) => {
  const { onMenuItemClicked, ...collectionsProps } = props;
  const { activeCollectionId } = collectionsProps;

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
        <Icon as={RssIcon} color={fg} w={[8, 10]} h="auto" />
        <Heading fontWeight={700} color={fg} as="h1" fontSize={['2xl', '4xl']}>
          Orpington News
        </Heading>
      </HStack>

      <SidebarItem
        title="Home"
        icon={AiOutlineHome}
        isActive={activeCollectionId === 'home'}
        onClick={handleClick('home')}
      />

      <SidebarItem
        title="Reading List"
        icon={BsBookmarks}
        isActive={activeCollectionId === 'readingList'}
        onClick={handleClick('readingList')}
      />

      <SidebarItem
        title="Add Feed"
        icon={RiAddBoxFill}
        isActive={false}
        onClick={handleClick('addFeed')}
      />

      <Divider />

      {collectionsProps && (
        <Collections
          {...collectionsProps}
          activeCollectionId={
            typeof activeCollectionId === 'number'
              ? activeCollectionId
              : undefined
          }
        />
      )}

      <Box w="full" style={{ marginTop: 'auto' }} pb={6}>
        <SidebarItem
          title="Organize"
          icon={CgReorder}
          isActive={activeCollectionId === 'organize'}
          onClick={handleClick('organize')}
        />
        <SidebarItem
          title="Settings"
          icon={RiSettingsLine}
          isActive={activeCollectionId === 'settings'}
          onClick={handleClick('settings')}
        />
      </Box>
    </VStack>
  );
};
