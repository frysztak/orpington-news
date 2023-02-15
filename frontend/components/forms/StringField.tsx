import React from 'react';
import {
  FormLabel,
  FormControl,
  FormErrorMessage,
  forwardRef,
  Input,
  InputProps,
  FormHelperText,
} from '@chakra-ui/react';
import { BasicField } from './types';
import { useFormControl } from './useFormControl';

export type StringFieldProps = BasicField & Omit<InputProps, 'value'>;

export const StringField = forwardRef<StringFieldProps, 'input'>(
  (props, ref) => {
    const { formControlProps, inputProps, meta, label, helperText } =
      useFormControl(props);

    return (
      <FormControl {...formControlProps}>
        {label && <FormLabel htmlFor={formControlProps.id}>{label}</FormLabel>}
        <Input {...inputProps} ref={ref} />
        {formControlProps.isInvalid ? (
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        ) : (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);
