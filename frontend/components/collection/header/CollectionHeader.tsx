import React from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
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
} from '@shared';
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
        data-test="refreshButton"
      />
      {/*<IconButton
              icon={<CgSearch />}
              aria-label="Search"
              variant="ghost"
            />*/}
      <Box>
        <Menu>
          <MenuTrigger asChild>
            <IconButton
              isDisabled={isLoading}
              icon={<BsLayoutWtf />}
              aria-label="Layout"
              variant="ghost"
              data-test="layoutButton"
            />
          </MenuTrigger>
          <MenuContent data-test="layoutMenuList">
            {collection && (
              <>
                <MenuLabel>List layout</MenuLabel>
                <MenuRadioGroup
                  value={collection.layout}
                  onValueChange={(layout: any) =>
                    onPreferenceChanged?.({ layout })
                  }
                >
                  {CollectionLayout.options.map((layout) => (
                    <MenuRadioItem
                      key={layout}
                      value={layout}
                      data-test={`layout-${layout}`}
                    >
                      {CollectionLayoutName[layout]}
                    </MenuRadioItem>
                  ))}
                </MenuRadioGroup>
              </>
            )}

            <Box display={{ base: 'none', lg: 'block' }}>
              <MenuDivider />

              <MenuLabel>Panes layout</MenuLabel>
              <MenuRadioGroup
                value={panesLayout}
                onValueChange={(layout: any) => onPanesLayoutChanged?.(layout)}
              >
                {PanesLayouts.map((layout) => (
                  <MenuRadioItem
                    key={layout}
                    value={layout}
                    data-test={`layout-${layout}`}
                  >
                    {PanesLayoutName[layout]}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
            </Box>
          </MenuContent>
        </Menu>
      </Box>

      <Box>
        <Menu>
          <MenuTrigger asChild>
            <IconButton
              isDisabled={isLoading}
              aria-label="Menu"
              icon={<BsThreeDotsVertical />}
              variant="ghost"
              tabIndex={0}
              data-test="menuButton"
            />
          </MenuTrigger>
          <MenuContent data-test="menuList">
            <MenuItem
              icon={<IconifyIcon icon={checkCircleOutline} />}
              onClick={() => onMenuActionClicked?.('markAsRead')}
              data-test="markAsRead"
            >
              Mark all as read
            </MenuItem>

            <MenuDivider />

            <MenuLabel>Show</MenuLabel>
            <MenuRadioGroup
              value={collection?.filter}
              onValueChange={(filter: any) => onPreferenceChanged?.({ filter })}
            >
              {CollectionFilter.options.map((filter) => (
                <MenuRadioItem
                  key={filter}
                  value={filter}
                  data-test={`show-${filter}`}
                >
                  {CollectionFilterName[filter]}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>

            <MenuDivider />

            <MenuLabel>Group by</MenuLabel>
            <MenuRadioGroup
              value={collection?.grouping}
              onValueChange={(grouping: any) =>
                onPreferenceChanged?.({ grouping })
              }
            >
              {CollectionGrouping.options.map((grouping) => (
                <MenuRadioItem
                  key={grouping}
                  value={grouping}
                  data-test={`grouping-${grouping}`}
                >
                  {CollectionGroupingName[grouping]}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>

            <MenuDivider />

            <MenuLabel>Sort by</MenuLabel>
            <MenuRadioGroup
              value={collection?.sortBy}
              onValueChange={(sortBy: any) => onPreferenceChanged?.({ sortBy })}
            >
              {CollectionSortBy.options.map((sortBy) => (
                <MenuRadioItem
                  key={sortBy}
                  value={sortBy}
                  data-test={`sortBy-${sortBy}`}
                >
                  {CollectionSortByName[sortBy]}
                </MenuRadioItem>
              ))}
            </MenuRadioGroup>
          </MenuContent>
        </Menu>
      </Box>
    </HStack>
  );

  return (
    <VStack
      spacing={0}
      w="full"
      pt={{ base: 1, lg: 4 }}
      px={1}
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
        px={3}
        minH={12}
      >
        {isLoading ? (
          <div className="skeleton w-full max-w-md" />
        ) : (
          <div className="flex h-full items-start">
            <Heading>{collection?.title}</Heading>
          </div>
        )}
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
