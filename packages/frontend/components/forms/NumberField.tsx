import React from 'react';
import {
  forwardRef,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';
import { NumberInput, NumberInputProps } from '@components/inputs';
import { BasicField } from './types';
import { useFormControl } from './useFormControl';

export type NumberFieldProps = BasicField &
  Omit<NumberInputProps, 'value'> & { isLoading?: boolean };

export const NumberField = forwardRef<NumberFieldProps, 'input'>(
  (props, ref) => {
    const { formControlProps, inputProps, meta, label } = useFormControl(props);

    return (
      <FormControl {...formControlProps}>
        {label && <FormLabel htmlFor={formControlProps.id}>{label}</FormLabel>}
        <NumberInput ref={ref} {...inputProps} />
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    );
  }
);
