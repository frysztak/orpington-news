import React from 'react';
import {
  Heading,
  HStack,
  Text,
  LinkBox,
  LinkOverlay,
  forwardRef,
  BoxProps,
  useColorModeValue,
  Icon,
  chakra,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { fromUnixTime } from 'date-fns';
import { clamp } from 'rambda';
import {
  CalendarDaysIcon,
  ClockIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { formatRelative } from '@utils';
import { CollectionItemProps } from '../../types';

export type ListItemProps = CollectionItemProps &
  BoxProps & {
    onReadingListButtonClicked?: () => void;
  };

export const ListItem = forwardRef((props: ListItemProps, ref) => {
  const { item, isActive, onReadingListButtonClicked, ...rest } = props;
  const { id, title, collection, readingTime, dateRead, datePublished } = item;
  const readingTimeRounded = clamp(1, 99, Math.ceil(readingTime));

  const borderColor = useColorModeValue('purple.300', 'gray.500');
  const backgroundColor = useColorModeValue('purple.50', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const titleEl = (
    <Heading
      fontSize="md"
      fontWeight={Boolean(dateRead) ? 500 : 700}
      flexGrow={1}
      noOfLines={1}
      w="full"
      data-test="title"
      data-test-read={Boolean(dateRead)}
    >
      {title}
    </Heading>
  );

  const publishedEl = (
    <HStack title="Published on" spacing={0} flexShrink={0} color={textColor}>
      <Icon as={CalendarDaysIcon} mr={1} />
      <span>{formatRelative(fromUnixTime(datePublished))}</span>
    </HStack>
  );

  const readingTimeEl = (
    <HStack title="Estimated reading time" spacing={0} color={textColor}>
      <Icon as={ClockIcon} mr={1} />
      <chakra.span w="4ch">{`${readingTimeRounded}m`}</chakra.span>
    </HStack>
  );

  return (
    <LinkBox
      as="article"
      ref={ref}
      mr={3}
      _hover={{
        backgroundColor,
      }}
      borderWidth={1}
      borderColor={isActive ? borderColor : 'transparent'}
      borderRadius="sm"
      transition="border-color 0.2s"
      {...rest}
    >
      <NextLink href={`/collection/${collection.id}/article/${id}`} passHref>
        <LinkOverlay>
          {/* Desktop */}
          <HStack
            w="full"
            alignItems="center"
            py={3}
            px={2}
            display={{ base: 'none', lg: 'flex' }}
          >
            <HStack
              flexShrink={0}
              flexGrow={0}
              w="20%"
              wordBreak="break-all"
              spacing={0}
              color={textColor}
            >
              <Icon as={NewspaperIcon} mr={1} />
              <Text noOfLines={1}>{collection.title}</Text>
            </HStack>
            {titleEl}
            {publishedEl}
            {readingTimeEl}
          </HStack>

          {/* Mobile */}
          <VStack
            w="full"
            alignItems="center"
            py={3}
            px={2}
            display={{ base: 'flex', lg: 'none' }}
          >
            {titleEl}
            <HStack w="full" justify="space-between">
              <HStack spacing={0} color={textColor}>
                <Icon as={NewspaperIcon} mr={1} />
                <Text noOfLines={1} wordBreak="break-all">
                  {collection.title}
                </Text>
              </HStack>
              <HStack>
                {publishedEl}
                {readingTimeEl}
              </HStack>
            </HStack>
          </VStack>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
});
