import React from 'react';
import {
  Heading,
  HStack,
  Image,
  Text,
  LinkBox,
  LinkOverlay,
  VStack,
  forwardRef,
  BoxProps,
  useColorModeValue,
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

export type MagazineItemProps = CollectionItemProps & BoxProps;

export const MagazineItem = forwardRef((props: MagazineItemProps, ref) => {
  const { item, isActive, ...rest } = props;
  const {
    id,
    title,
    summary,
    thumbnailUrl,
    collection,
    readingTime,
    dateRead,
    datePublished,
  } = item;
  const readingTimeRounded = clamp(1, 99, Math.ceil(readingTime));

  const activeBorder = useColorModeValue('purple.300', 'gray.500');

  return (
    <LinkBox as="article" ref={ref} py={2} pr={3} {...rest}>
      <HStack
        spacing={4}
        p={2}
        align="stretch"
        borderWidth="1px"
        borderRadius="md"
        borderColor={isActive ? activeBorder : 'transparent'}
        transition="border-color 0.2s"
      >
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            flexShrink={0}
            w={[24, 40]}
            h={[24, 40]}
            mt={1}
            mb="auto"
            objectFit="cover"
            borderRadius={4}
          />
        )}

        <VStack align="flex-start">
          <NextLink
            passHref
            legacyBehavior
            href={`/?collectionId=${collection.id}&itemId=${id}`}
            as={`/collection/${collection.id}/article/${id}`}
          >
            <LinkOverlay>
              <Heading
                fontSize={['lg', '2xl']}
                fontWeight={Boolean(dateRead) ? 500 : 700}
                data-test="title"
                data-test-read={Boolean(dateRead)}
              >
                {title}
              </Heading>
            </LinkOverlay>
          </NextLink>
          <Text noOfLines={[2, 3]} overflowWrap="anywhere">
            {summary}
          </Text>
          <HStack color="gray.500">
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
        </VStack>
      </HStack>
    </LinkBox>
  );
});
