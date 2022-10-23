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
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { format, fromUnixTime } from 'date-fns';
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
  const readingTimeRounded = Math.ceil(readingTime);

  const activeBorder = useColorModeValue('purple.300', 'gray.500');

  return (
    <LinkBox as="article" ref={ref} {...rest}>
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
            href={`/collection/${collection.id}/article/${id}`}
            passHref
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
          <Text color="gray.500">
            by {collection.title} •{' '}
            {format(fromUnixTime(datePublished), 'dd/MM/yyyy')}
            {readingTimeRounded > 0 && ` • about ${readingTimeRounded} min`}
          </Text>
        </VStack>
      </HStack>
    </LinkBox>
  );
});
