import React from 'react';
import { chakra, forwardRef, Input, InputProps } from '@chakra-ui/react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

export type NumberInputProps = InputProps & NumericFormatProps;

const ChakraNumberFormat = chakra(NumericFormat, {
  shouldForwardProp: (prop: string) => prop !== 'isLoading',
});

export const NumberInput = forwardRef<NumberInputProps, 'input'>(
  (props, ref) => {
    return (
      <ChakraNumberFormat
        ref={ref}
        customInput={Input as any} // TS seems to have a problem here...
        {...props}
      />
    );
  }
);
