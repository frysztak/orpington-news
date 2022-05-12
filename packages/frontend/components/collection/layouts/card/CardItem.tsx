import React from 'react';
import {
  Heading,
  HStack,
  Text,
  LinkBox,
  LinkOverlay,
  forwardRef,
  BoxProps,
  Box,
  IconButton,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { BsBookmarkDash } from '@react-icons/all-files/bs/BsBookmarkDash';
import { BsBookmarkPlus } from '@react-icons/all-files/bs/BsBookmarkPlus';
import { CollectionItemProps } from '../../types';

export type CardItemProps = CollectionItemProps &
  BoxProps & {
    onReadingListButtonClicked?: () => void;
  };

export const CardItem = forwardRef((props: CardItemProps, ref) => {
  const { item, onReadingListButtonClicked, ...rest } = props;
  const {
    id,
    title,
    summary,
    collection,
    readingTime,
    dateRead,
    onReadingList,
  } = item;
  const readingTimeRounded = Math.ceil(readingTime);

  return (
    <LinkBox as="article" ref={ref} {...rest}>
      <VStack
        w="full"
        justifyContent="space-between"
        borderRadius="md"
        border="1px"
        borderColor={useColorModeValue('gray.300', 'gray.700')}
      >
        <HStack w="full" justifyContent="space-between" alignItems="flex-start">
          <NextLink
            href={`/collection/${collection.id}/article/${id}`}
            passHref
          >
            <LinkOverlay>
              <Heading
                fontSize={['lg', '2xl']}
                p={3}
                fontWeight={Boolean(dateRead) ? 500 : 700}
              >
                {title}
              </Heading>
            </LinkOverlay>
          </NextLink>

          {/*<IconButton
            icon={onReadingList ? <BsBookmarkDash /> : <BsBookmarkPlus />}
            aria-label={
              onReadingList ? 'Remove from reading list' : 'Add to reading list'
            }
            variant="ghost"
            onClick={onReadingListButtonClicked}
          />*/}
        </HStack>
        <Box
          p={3}
          w="full"
          background={useColorModeValue('gray.300', 'gray.700')}
        >
          <Text noOfLines={[2, 3]} overflowWrap="anywhere">
            {summary}
          </Text>
          <Text color="gray.500">
            by {collection.title}
            {readingTimeRounded > 0 && ` • about ${readingTimeRounded} min`}
          </Text>
        </Box>
      </VStack>
    </LinkBox>
  );
});
