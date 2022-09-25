import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { Icon, VStack, Text } from '@chakra-ui/react';

export const EmptyMain: React.FC = (props) => {
  return (
    <VStack spacing={6} w="full" h="100vh" justify="center">
      {/* TODO: use 'tap' icon on mobile */}
      <Icon as={InformationCircleIcon} w={12} h="auto" color="blue.400" />
      <Text fontSize="xl" fontWeight="bold">
        If you click on an article, it&apos;ll appear here.
      </Text>
    </VStack>
  );
};
