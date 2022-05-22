import {
  Box,
  Divider,
  HStack,
  Skeleton,
  SkeletonText,
  VStack,
} from '@chakra-ui/react';

export const ArticleSkeleton: React.FC = () => {
  return (
    <>
      <HStack w="full" justify="flex-end" h={12}></HStack>

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
