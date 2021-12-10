import React from 'react';
import {
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
    const { formControlProps, inputProps, meta } = useFormControl(props);

    return (
      <FormControl {...formControlProps}>
        <Input {...inputProps} ref={ref} />
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    );
  }
);
