import React from 'react';
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Skeleton,
  VStack,
} from '@chakra-ui/react';
import { CgMenuLeftAlt } from '@react-icons/all-files/cg/CgMenuLeftAlt';
import { BsLayoutWtf } from '@react-icons/all-files/bs/BsLayoutWtf';
import { IoRefresh } from '@react-icons/all-files/io5/IoRefresh';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';
import { IoCheckmarkDone } from '@react-icons/all-files/io5/IoCheckmarkDone';
import {
  CollectionLayout,
  CollectionFilter,
  ActiveCollection,
  CollectionGrouping,
  CollectionSortBy,
  CollectionPreferences,
} from '@orpington-news/shared';
import {
  CollectionLayoutName,
  CollectionFilterName,
  CollectionGroupingName,
  CollectionSortByName,
} from '../types';

export type MenuAction = 'refresh' | 'markAsRead';

export interface CollectionHeaderProps {
  collection?: ActiveCollection;
  menuButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  isRefreshing?: boolean;

  onHamburgerClicked?: () => void;
  onMenuActionClicked?: (action: MenuAction) => void;
  onPreferenceChanged?: (preferences: CollectionPreferences) => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = (props) => {
  const {
    collection,
    menuButtonRef,
    isRefreshing = false,
    onHamburgerClicked,
    onMenuActionClicked,
    onPreferenceChanged,
  } = props;

  const isLoading = collection === undefined;

  return (
    <VStack spacing={0} w="full" data-test="collectionHeader">
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
          data-test="hamburgerButton"
        />

        <HStack>
          <IconButton
            icon={<IoRefresh />}
            isLoading={isRefreshing}
            isDisabled={isLoading}
            aria-label="Refresh"
            variant="ghost"
            onClick={() => onMenuActionClicked?.('refresh')}
          />
          {/*<IconButton
              icon={<CgSearch />}
              aria-label="Search"
              variant="ghost"
            />*/}
          <Box>
            <Menu>
              <MenuButton
                as={IconButton}
                isDisabled={isLoading}
                icon={<BsLayoutWtf />}
                aria-label="Layout"
                variant="ghost"
                data-test="layoutButton"
              />
              <MenuList data-focus-visible-disabled data-test="layoutMenuList">
                {collection && (
                  <MenuOptionGroup
                    value={collection.layout}
                    title="Layout"
                    type="radio"
                  >
                    {CollectionLayout.options.map((layout) => (
                      <MenuItemOption
                        key={layout}
                        value={layout}
                        onClick={() => onPreferenceChanged?.({ layout })}
                        data-test={`layout-${layout}`}
                      >
                        {CollectionLayoutName[layout]}
                      </MenuItemOption>
                    ))}
                  </MenuOptionGroup>
                )}
              </MenuList>
            </Menu>
          </Box>

          <Box>
            <Menu>
              <MenuButton
                as={IconButton}
                isDisabled={isLoading}
                aria-label="Menu"
                icon={<BsThreeDotsVertical />}
                variant="ghost"
                tabIndex={0}
                data-test="menuButton"
              />
              <MenuList
                data-focus-visible-disabled
                data-test="menuList"
                zIndex="docked"
              >
                <MenuItem
                  icon={<IoCheckmarkDone />}
                  onClick={() => onMenuActionClicked?.('markAsRead')}
                  data-test="markAsRead"
                >
                  Mark all as read
                </MenuItem>

                <MenuDivider />

                <MenuOptionGroup
                  value={collection?.filter}
                  title="Show"
                  type="radio"
                >
                  {CollectionFilter.options.map((filter) => (
                    <MenuItemOption
                      key={filter}
                      value={filter}
                      onClick={() => onPreferenceChanged?.({ filter })}
                      data-test={`show-${filter}`}
                    >
                      {CollectionFilterName[filter]}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>

                <MenuDivider />

                <MenuOptionGroup
                  value={collection?.grouping}
                  title="Group by"
                  type="radio"
                >
                  {CollectionGrouping.options.map((grouping) => (
                    <MenuItemOption
                      key={grouping}
                      value={grouping}
                      onClick={() => onPreferenceChanged?.({ grouping })}
                      data-test={`grouping-${grouping}`}
                    >
                      {CollectionGroupingName[grouping]}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>

                <MenuDivider />

                <MenuOptionGroup
                  value={collection?.sortBy}
                  title="Sort by"
                  type="radio"
                >
                  {CollectionSortBy.options.map((sortBy) => (
                    <MenuItemOption
                      key={sortBy}
                      value={sortBy}
                      onClick={() => onPreferenceChanged?.({ sortBy })}
                      data-test={`sortBy-${sortBy}`}
                    >
                      {CollectionSortByName[sortBy]}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          </Box>
        </HStack>
      </HStack>

      <HStack w="full" justify="flex-start" minH={12}>
        <Skeleton
          isLoaded={!isLoading}
          mx={4}
          h="full"
          w="full"
          maxW={isLoading ? 96 : 'unset'}
        >
          <Heading>{collection?.title}</Heading>
        </Skeleton>
      </HStack>
    </VStack>
  );
};
