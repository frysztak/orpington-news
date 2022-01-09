import React from 'react';
import { Box, Heading, HStack, IconButton, VStack } from '@chakra-ui/react';
import { CgMenuLeftAlt, CgSearch } from 'react-icons/cg';
import { BsLayoutWtf } from 'react-icons/bs';
import { IoRefresh } from 'react-icons/io5';
import { ActiveCollection, LayoutType } from '../types';

export interface CollectionHeaderProps {
  collection?: ActiveCollection;
  menuButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  hideMenuButton?: boolean;

  onMenuClicked?: () => void;
  onRefresh?: () => void;
  onChangeLayout?: (layout: LayoutType) => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = (props) => {
  const {
    collection,
    menuButtonRef,
    hideMenuButton = false,
    onMenuClicked,
    onRefresh,
    onChangeLayout,
  } = props;
  return (
    <VStack spacing={1} w="full">
      <HStack w="full" justify={hideMenuButton ? 'flex-end' : 'space-between'}>
        {!hideMenuButton && (
          <IconButton
            icon={<CgMenuLeftAlt />}
            aria-label="Menu"
            variant="ghost"
            ref={menuButtonRef}
            onClick={onMenuClicked}
          />
        )}

        {collection && (
          <Box>
            <IconButton
              icon={<IoRefresh />}
              aria-label="Refresh"
              variant="ghost"
              onClick={onRefresh}
            />
            <IconButton
              icon={<CgSearch />}
              aria-label="Search"
              variant="ghost"
            />
            <IconButton
              icon={<BsLayoutWtf />}
              aria-label="Layout"
              variant="ghost"
            />
          </Box>
        )}
      </HStack>

      {collection && (
        <HStack w="full" justify="flex-start">
          <Heading pl={4}>{collection.title}</Heading>
        </HStack>
      )}
    </VStack>
  );
};
