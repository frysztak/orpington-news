import React from 'react';
import {
  FormLabel,
  FormControl,
  FormErrorMessage,
  forwardRef,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { BasicField } from './types';
import { useFormControl } from './useFormControl';

export type StringFieldProps = BasicField & Omit<InputProps, 'value'>;

export const StringField = forwardRef<StringFieldProps, 'input'>(
  (props, ref) => {
    const { formControlProps, inputProps, meta, label } = useFormControl(props);

    return (
      <FormControl {...formControlProps}>
        {label && <FormLabel htmlFor={formControlProps.id}>{label}</FormLabel>}
        <Input {...inputProps} ref={ref} />
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    );
  }
);
