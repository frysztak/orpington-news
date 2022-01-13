import {
  Box,
  Icon,
  Divider,
  Heading,
  HStack,
  IconButton,
  Text,
  Link,
  VStack,
} from '@chakra-ui/react';
import { CollectionItemDetails } from '@orpington-news/shared';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { BsBookmarkDash, BsBookmarkPlus } from 'react-icons/bs';
import { CgCalendar, CgTime } from 'react-icons/cg';
import { format, fromUnixTime } from 'date-fns';

export interface ArticleHeaderProps {
  article: CollectionItemDetails;
  onReadingListToggle?: () => void;
}

export const ArticleHeader: React.FC<ArticleHeaderProps> = (props) => {
  const {
    article: { title, link, datePublished, readingTime, onReadingList },
    onReadingListToggle,
  } = props;

  return (
    <VStack w="full" align="flex-start" spacing={1}>
      <HStack w="full" justify="flex-end">
        <IconButton
          icon={<HiOutlineExternalLink />}
          as={Link}
          isExternal
          href={link}
          aria-label="Open external link"
          variant="ghost"
        />
        <IconButton
          icon={onReadingList ? <BsBookmarkDash /> : <BsBookmarkPlus />}
          aria-label={
            onReadingList ? 'Remove from reading list' : 'Add to reading list'
          }
          variant="ghost"
          onClick={onReadingListToggle}
        />
      </HStack>

      <Heading>{title}</Heading>
      <Box>
        <Text color="gray.500" as={HStack}>
          <Icon as={CgCalendar} mr={1} />
          <>
            published on{' '}
            {format(fromUnixTime(datePublished), 'dd/MM/yyyy (EEE)')}
          </>
        </Text>
        <Text color="gray.500" as={HStack}>
          <Icon as={CgTime} mr={1} />
          <>estimated reading time {Math.ceil(readingTime)} minutes</>
        </Text>
      </Box>

      <Divider pt={3} />
    </VStack>
  );
};
