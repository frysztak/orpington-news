import React from 'react';
import {
  Heading,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  VStack,
} from '@chakra-ui/react';
import { CgMenuLeftAlt } from '@react-icons/all-files/cg/CgMenuLeftAlt';
import { BsLayoutWtf } from '@react-icons/all-files/bs/BsLayoutWtf';
import { IoRefresh } from '@react-icons/all-files/io5/IoRefresh';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';
import { IoCheckmarkDone } from '@react-icons/all-files/io5/IoCheckmarkDone';
import { CollectionLayout, CollectionLayouts } from '@orpington-news/shared';
import { ActiveCollection, CollectionLayoutName } from '../types';

export type MenuAction = 'refresh' | 'markAsRead';

export interface CollectionHeaderProps {
  collection?: ActiveCollection;
  menuButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  isRefreshing?: boolean;

  onHamburgerClicked?: () => void;
  onChangeLayout?: (layout: CollectionLayout) => void;
  onMenuActionClicked?: (action: MenuAction) => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = (props) => {
  const {
    collection,
    menuButtonRef,
    isRefreshing = false,
    onHamburgerClicked,
    onChangeLayout,
    onMenuActionClicked,
  } = props;

  return (
    <VStack spacing={0} w="full">
      <HStack
        spacing={0}
        w="full"
        justify={{ base: 'space-between', lg: 'flex-end' }}
      >
        <IconButton
          display={{ base: 'inline-flex', lg: 'none' }}
          icon={<CgMenuLeftAlt />}
          aria-label="Menu"
          variant="ghost"
          ref={menuButtonRef}
          onClick={onHamburgerClicked}
        />

        {collection && (
          <HStack>
            <IconButton
              icon={<IoRefresh />}
              isLoading={isRefreshing}
              aria-label="Refresh"
              variant="ghost"
              onClick={() => onMenuActionClicked?.('refresh')}
            />
            {/*<IconButton
              icon={<CgSearch />}
              aria-label="Search"
              variant="ghost"
            />*/}
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<BsLayoutWtf />}
                aria-label="Layout"
                variant="ghost"
              />
              <MenuList>
                <MenuOptionGroup
                  value={collection.layout}
                  title="Layout"
                  type="radio"
                >
                  {CollectionLayouts.map((layout) => (
                    <MenuItemOption
                      key={layout}
                      value={layout}
                      onClick={() => onChangeLayout?.(layout)}
                    >
                      {CollectionLayoutName[layout]}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>

            <Menu>
              <MenuButton
                as={IconButton}
                aria-label="Menu"
                icon={<BsThreeDotsVertical />}
                variant="ghost"
                tabIndex={0}
              />
              <MenuList>
                <MenuItem
                  icon={<IoCheckmarkDone />}
                  onClick={() => onMenuActionClicked?.('markAsRead')}
                >
                  Mark as read
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        )}
      </HStack>

      {collection && (
        <HStack w="full" justify="flex-start">
          <Heading px={4}>{collection.title}</Heading>
        </HStack>
      )}
    </VStack>
  );
};
