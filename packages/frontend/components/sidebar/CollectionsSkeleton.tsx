import { HStack, SkeletonCircle, SkeletonText, VStack } from '@chakra-ui/react';

const SidebarItemSkeleton: React.FC<{ nested?: boolean }> = ({ nested }) => {
  return (
    <HStack pl={nested ? 10 : 6} pr={3} spacing={4} w="full" h={10}>
      <SkeletonCircle size="6" flexShrink={0} />
      <SkeletonText noOfLines={1} py={2} w="full" h={10} skeletonHeight={6} />
    </HStack>
  );
};

export const CollectionsSkeleton: React.FC = () => {
  return (
    <VStack spacing={2} w="full">
      <SidebarItemSkeleton />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton nested />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton />
      <SidebarItemSkeleton nested />
    </VStack>
  );
};
