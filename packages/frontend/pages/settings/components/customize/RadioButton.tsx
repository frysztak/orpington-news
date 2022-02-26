import React from 'react';
import { Box, useRadio, UseRadioProps } from '@chakra-ui/react';

type RadioButtonProps = UseRadioProps;

export const RadioButton: React.FC<RadioButtonProps> = (props) => {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  const bg = 'purple.300';

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg,
          color: 'white',
          borderColor: bg,
        }}
        _focus={{
          boxShadow: 'outline',
        }}
      >
        {props.children}
      </Box>
    </Box>
  );
};
