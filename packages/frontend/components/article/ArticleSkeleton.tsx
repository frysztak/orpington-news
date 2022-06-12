import {
  Box,
  Divider,
  HStack,
  IconButton,
  Skeleton,
  SkeletonText,
  VStack,
} from '@chakra-ui/react';
import { HiOutlineExternalLink } from '@react-icons/all-files/hi/HiOutlineExternalLink';
import { IoReturnUpBack } from '@react-icons/all-files/io5/IoReturnUpBack';
import { BsThreeDotsVertical } from '@react-icons/all-files/bs/BsThreeDotsVertical';

export interface ArticleSkeletonProps {
  onGoBackClicked?: () => void;
}

export const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({
  onGoBackClicked,
}) => {
  return (
    <>
      <HStack w="full" justify="flex-end">
        <IconButton
          icon={<IoReturnUpBack />}
          aria-label="Go back to collection"
          variant="ghost"
          mr="auto"
          onClick={onGoBackClicked}
          display={{ base: 'inline-flex', lg: 'none' }}
        />

        <IconButton
          icon={<HiOutlineExternalLink />}
          isDisabled
          aria-label="Open external link"
          variant="ghost"
        />

        <IconButton
          aria-label="Menu"
          icon={<BsThreeDotsVertical />}
          isDisabled
          variant="ghost"
        />
      </HStack>

      <VStack w="full" align="flex-start" spacing={2} px={4}>
        <Skeleton w="full" h={10} />
        <SkeletonText
          skeletonHeight={5}
          mt={1}
          w="full"
          noOfLines={2}
          spacing={2}
        />

        <Divider pt={3} />
      </VStack>

      <Box w="full" px={4} py={4}>
        <SkeletonText
          skeletonHeight={4}
          mt={1}
          w="full"
          noOfLines={4}
          spacing={2}
        />
      </Box>
    </>
  );
};
