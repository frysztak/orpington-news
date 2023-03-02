import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

export interface FileDropZoneProps {
  isLoading?: boolean;
  onDrop: (files: File[]) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = (props) => {
  const { isLoading, onDrop } = props;

  const { getInputProps, getRootProps } = useDropzone({
    onDrop,
    accept: {
      'application/xml': ['.xml', '.opml'],
      'text/xml': ['.xml', '.opml'],
      'text/x-opml': ['.xml', '.opml'],
    },
    useFsAccessApi: false,
    disabled: isLoading,
  });

  return (
    <Box
      borderWidth={2}
      borderStyle="dashed"
      borderRadius="xs"
      p={8}
      cursor={isLoading ? '' : 'pointer'}
      transition="border-color 0.2s"
      _hover={{
        borderColor: isLoading ? '' : 'gray.400',
      }}
      opacity={isLoading ? 0.7 : 1}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <Text align="center">Drag &apos;n&apos; drop or select OPML file</Text>
    </Box>
  );
};
