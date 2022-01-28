import React from 'react';
import InformationCircleIcon from '@heroicons/react/solid/InformationCircleIcon';
import { Icon, VStack, Text } from '@chakra-ui/react';

export const EmptyMain: React.FC = (props) => {
  return (
    <VStack spacing={6} h="full" justify="center">
      {/* TODO: use 'tap' icon on mobile */}
      <Icon as={InformationCircleIcon} w={12} h="auto" color="blue.400" />
      <Text fontSize="xl" fontWeight="bold">
        If you click on an article, it&apos;ll appear here.
      </Text>
    </VStack>
  );
};
