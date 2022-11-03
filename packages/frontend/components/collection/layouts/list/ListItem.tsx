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
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { format, fromUnixTime } from 'date-fns';
import { clamp } from 'rambda';
import { CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
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
          <HStack w="full" alignItems="center" py={3} px={2}>
            <Text
              flexBasis={24}
              fontSize="md"
              noOfLines={1}
              flexShrink={0}
              color={textColor}
            >
              {collection.title}
            </Text>
            <Heading
              fontSize="md"
              fontWeight={Boolean(dateRead) ? 500 : 700}
              flexGrow={1}
              noOfLines={1}
              data-test="title"
              data-test-read={Boolean(dateRead)}
            >
              {title}
            </Heading>
            <HStack title="Published on" spacing={0} color={textColor}>
              <Icon as={CalendarDaysIcon} mr={1} />
              <span>{format(fromUnixTime(datePublished), 'dd/MM/yyyy')}</span>
            </HStack>
            <HStack
              title="Estimated reading time"
              spacing={0}
              color={textColor}
            >
              <Icon as={ClockIcon} mr={1} />
              <chakra.span w="4ch">
                {readingTimeRounded > 0 && `${readingTimeRounded}m`}
              </chakra.span>
            </HStack>
          </HStack>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
});
