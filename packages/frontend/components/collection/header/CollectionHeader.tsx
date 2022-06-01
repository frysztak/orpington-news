import React from 'react';
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  VStack,
} from '@chakra-ui/react';
import { CgMenuLeftAlt } from '@react-icons/all-files/cg/CgMenuLeftAlt';
import { BsLayoutWtf } from '@react-icons/all-files/bs/BsLayoutWtf';
import { IoRefresh } from '@react-icons/all-files/io5/IoRefresh';
import { ActiveCollection, CollectionLayoutName } from '../types';
import { CollectionLayout, CollectionLayouts } from '@orpington-news/shared';

export interface CollectionHeaderProps {
  collection?: ActiveCollection;
  menuButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  isRefreshing?: boolean;

  onMenuClicked?: () => void;
  onRefresh?: () => void;
  onChangeLayout?: (layout: CollectionLayout) => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = (props) => {
  const {
    collection,
    menuButtonRef,
    isRefreshing = false,
    onMenuClicked,
    onRefresh,
    onChangeLayout,
  } = props;

  return (
    <VStack spacing={1} w="full">
      <HStack w="full" justify={{ base: 'space-between', lg: 'flex-end' }}>
        <IconButton
          display={{ base: 'inline-flex', lg: 'none' }}
          icon={<CgMenuLeftAlt />}
          aria-label="Menu"
          variant="ghost"
          ref={menuButtonRef}
          onClick={onMenuClicked}
        />

        {collection && (
          <Box>
            <IconButton
              icon={<IoRefresh />}
              isLoading={isRefreshing}
              aria-label="Refresh"
              variant="ghost"
              onClick={onRefresh}
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
          </Box>
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
