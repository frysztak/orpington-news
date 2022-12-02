import React from 'react';
import {
  Box,
  Flex,
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
import { Icon as IconifyIcon } from '@iconify/react';
import checkCircleOutline from '@iconify/icons-mdi/check-circle-outline';
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
  PanesLayouts,
  PanesLayoutName,
  PanesLayout,
} from '../types';

export type MenuAction = 'refresh' | 'markAsRead';

export interface CollectionHeaderProps {
  collection?: ActiveCollection;
  menuButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  isRefreshing?: boolean;
  panesLayout?: PanesLayout;

  onHamburgerClicked?: () => void;
  onMenuActionClicked?: (action: MenuAction) => void;
  onPreferenceChanged?: (preferences: CollectionPreferences) => void;
  onPanesLayoutChanged?: (layout: PanesLayout) => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = (props) => {
  const {
    collection,
    menuButtonRef,
    isRefreshing = false,
    panesLayout,

    onHamburgerClicked,
    onMenuActionClicked,
    onPreferenceChanged,
    onPanesLayoutChanged,
  } = props;

  const isLoading = collection === undefined;

  const actions = (
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
          <MenuList
            zIndex="docked"
            data-focus-visible-disabled
            data-test="layoutMenuList"
          >
            {collection && (
              <MenuOptionGroup
                value={collection.layout}
                title="List layout"
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

            <Box display={{ base: 'none', lg: 'block' }}>
              <MenuDivider />

              <MenuOptionGroup
                value={panesLayout}
                title="Panes layout"
                type="radio"
              >
                {PanesLayouts.map((layout) => (
                  <MenuItemOption
                    key={layout}
                    value={layout}
                    onClick={() => onPanesLayoutChanged?.(layout)}
                    data-test={`layout-${layout}`}
                  >
                    {PanesLayoutName[layout]}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </Box>
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
              icon={<IconifyIcon icon={checkCircleOutline} />}
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
  );

  return (
    <VStack
      spacing={0}
      w="full"
      pt={{ base: 0, lg: 4 }}
      data-test="collectionHeader"
    >
      <HStack
        w="full"
        justify="space-between"
        display={{ base: 'flex', lg: 'none' }}
      >
        <IconButton
          icon={<CgMenuLeftAlt />}
          aria-label="Menu"
          variant="ghost"
          ref={menuButtonRef}
          onClick={onHamburgerClicked}
          data-test="hamburgerButton"
        />

        {actions}
      </HStack>

      <HStack
        h="full"
        w="full"
        justify="space-between"
        align="stretch"
        px={4}
        minH={12}
      >
        <Skeleton
          isLoaded={!isLoading}
          w="full"
          maxW={isLoading ? 96 : 'unset'}
        >
          <Flex h="full" align="flex-start">
            <Heading>{collection?.title}</Heading>
          </Flex>
        </Skeleton>
        <Flex
          h="full"
          align="flex-start"
          display={{ base: 'none', lg: 'flex' }}
        >
          {actions}
        </Flex>
      </HStack>
    </VStack>
  );
};
