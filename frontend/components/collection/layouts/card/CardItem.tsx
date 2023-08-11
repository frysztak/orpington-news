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
  Icon,
  chakra,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { fromUnixTime } from 'date-fns';
import {
  CalendarDaysIcon,
  ClockIcon,
  NewspaperIcon,
} from '@heroicons/react/24/solid';
import { formatRelative } from '@utils';
import { clamp } from 'rambda';
import { CollectionItemProps } from '../../types';

export type CardItemProps = CollectionItemProps &
  BoxProps & {
    onReadingListButtonClicked?: () => void;
  };

export const CardItem = forwardRef((props: CardItemProps, ref) => {
  const { item, isActive, onReadingListButtonClicked, ...rest } = props;
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
  const readingTimeRounded = clamp(1, 99, Math.ceil(readingTime));

  const inactiveBorder = useColorModeValue('purple.50', 'gray.700');
  const activeBorder = useColorModeValue('purple.300', 'gray.500');
  const borderColor = isActive ? activeBorder : inactiveBorder;

  return (
    <LinkBox as="article" ref={ref} py={2} pr={3} {...rest}>
      <VStack
        w="full"
        justifyContent="space-between"
        borderRadius="md"
        border="1px"
        borderColor={borderColor}
        transition="border-color 0.2s"
      >
        <HStack w="full" justifyContent="space-between" alignItems="flex-start">
          <NextLink
            passHref
            legacyBehavior
            href={`/?collectionId=${collection.id}&itemId=${id}`}
            as={`/collection/${collection.id}/article/${id}`}
          >
            <LinkOverlay>
              <Heading
                fontSize={['lg', '2xl']}
                p={3}
                fontWeight={Boolean(dateRead) ? 500 : 700}
                data-test="title"
                data-test-read={Boolean(dateRead)}
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
          borderColor={borderColor}
          borderWidth="0px 1px 1px 1px"
          borderBottomRadius="md"
          transition="border-color 0.2s"
        >
          <Text noOfLines={[2, 3]} overflowWrap="anywhere">
            {summary}
          </Text>
          <HStack color={useColorModeValue('gray.600', 'gray.400')}>
            <HStack spacing={0}>
              <Icon as={NewspaperIcon} mr={1} />
              <Text noOfLines={1} wordBreak="break-all">
                {collection.title}
              </Text>
            </HStack>

            <HStack title="Published on" spacing={0} flexShrink={0}>
              <Icon as={CalendarDaysIcon} mr={1} />
              <span>{formatRelative(fromUnixTime(datePublished))}</span>
            </HStack>

            <HStack title="Estimated reading time" spacing={0}>
              <Icon as={ClockIcon} mr={1} />
              <chakra.span w="4ch">{`${readingTimeRounded}m`}</chakra.span>
            </HStack>
          </HStack>
        </Box>
      </VStack>
    </LinkBox>
  );
});
