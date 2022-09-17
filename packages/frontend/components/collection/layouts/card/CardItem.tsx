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
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { format, fromUnixTime } from 'date-fns';
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
    datePublished,
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
        borderColor={useColorModeValue('purple.50', 'gray.700')}
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
                data-test="title"
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
          w="calc(100% + 2px)"
          mb="-1px !important"
          background={useColorModeValue('purple.50', 'gray.700')}
          borderBottomRadius="md"
        >
          <Text noOfLines={[2, 3]} overflowWrap="anywhere">
            {summary}
          </Text>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            by {collection.title} •{' '}
            {format(fromUnixTime(datePublished), 'dd/MM/yyyy')}
            {readingTimeRounded > 0 && ` • about ${readingTimeRounded} min`}
          </Text>
        </Box>
      </VStack>
    </LinkBox>
  );
});
