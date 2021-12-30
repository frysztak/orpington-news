import React from 'react';
import { HiCursorClick } from 'react-icons/hi';
import { Icon, VStack, Heading } from '@chakra-ui/react';

export const EmptyMain: React.FC = (props) => {
  return (
    <VStack spacing={6} h="full" justify="center">
      {/* TODO: use 'tap' icon on mobile */}
      <Icon as={HiCursorClick} w={16} h="auto" />
      <Heading>Choose something to read</Heading>
    </VStack>
  );
};
