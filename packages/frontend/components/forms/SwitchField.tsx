import React, { ChangeEvent, useCallback } from 'react';
import {
  FormLabel,
  FormControl,
  FormErrorMessage,
  forwardRef,
  Switch,
  SwitchProps,
  Tooltip,
} from '@chakra-ui/react';
import { BasicField } from './types';
import { useFormControl } from './useFormControl';
import { FieldLabel } from './FieldLabel';

export type SwitchFieldProps = BasicField & SwitchProps;

export const SwitchField = forwardRef<SwitchFieldProps, 'input'>(
  (props, ref) => {
    const { formControlProps, inputProps, meta, label, labelTooltip, helpers } =
      useFormControl(props);

    const handleChange = useCallback(
      (value: ChangeEvent<HTMLInputElement>) => {
        helpers.setTouched(true);
        helpers.setValue(value.currentTarget.checked);
      },
      [helpers]
    );

    return (
      <FormControl display="flex" alignItems="center" {...formControlProps}>
        <FieldLabel
          id={formControlProps.id}
          label={label}
          labelTooltip={labelTooltip}
        />
        <Switch
          {...inputProps}
          ref={ref}
          onChange={handleChange}
          isChecked={!!meta.value}
        />
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    );
  }
);
