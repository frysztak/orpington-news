import React from 'react';
import { forwardRef, BoxProps, useColorModeValue, Box } from '@chakra-ui/react';
import { Article } from '@features/Article';
import { CollectionItemProps } from '../../types';

export type ExpandedItemProps = CollectionItemProps &
  BoxProps & {
    onReadingListButtonClicked?: () => void;
  };

export const ExpandedItem = forwardRef((props: ExpandedItemProps, ref) => {
  const {
    item: { id, collection },
    isActive,
  } = props;
  const inactiveBorder = useColorModeValue('purple.50', 'gray.700');
  const activeBorder = useColorModeValue('purple.300', 'gray.500');
  const borderColor = isActive ? activeBorder : inactiveBorder;

  return (
    <Box w="full" py={2}>
      <Box
        mr={3}
        borderRadius="md"
        border="1px"
        borderColor={borderColor}
        transition="border-color 0.2s"
      >
        <Article
          isRouterReady
          fullHeight={false}
          collectionId={collection.id}
          itemId={id}
        />
      </Box>
    </Box>
  );
});
