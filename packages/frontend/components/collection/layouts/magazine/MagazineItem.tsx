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
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { CollectionItemProps } from '../../types';

export type MagazineItemProps = CollectionItemProps & BoxProps;

export const MagazineItem = forwardRef((props: MagazineItemProps, ref) => {
  const { item, ...rest } = props;
  const { title, summary, slug, thumbnailUrl, collection, readingTime } = item;

  return (
    <LinkBox as="article" ref={ref} {...rest}>
      <HStack spacing={4} align="stretch">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={`${title} thumbnail`}
            flexShrink={0}
            w={[24, 40]}
            h={[24, 40]}
            my="auto"
            objectFit="cover"
            borderRadius={4}
          />
        )}

        <VStack align="flex-start">
          <NextLink href={`${collection.slug}/${slug}`} passHref>
            <LinkOverlay>
              <Heading fontSize={['lg', '2xl']}>{title}</Heading>
            </LinkOverlay>
          </NextLink>
          <Text noOfLines={[2, 3]}>{summary}</Text>
          <Text color="gray.500">
            by {collection.name} • {readingTime} min
          </Text>
        </VStack>
      </HStack>
    </LinkBox>
  );
});
