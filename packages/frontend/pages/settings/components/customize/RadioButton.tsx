import React from 'react';
import { Box, useRadio, UseRadioProps } from '@chakra-ui/react';
import { ReactFCC } from '@utils/react';

type RadioButtonProps = UseRadioProps;

export const RadioButton: ReactFCC<RadioButtonProps> = (props) => {
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
