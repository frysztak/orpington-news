import React, { useCallback, useMemo } from 'react';
import {
  FormLabel,
  FormControl,
  FormErrorMessage,
  forwardRef,
} from '@chakra-ui/react';
import { Select, OptionBase } from 'chakra-react-select';
import type { OnChangeValue, ActionMeta } from 'react-select';
import type { BasicField } from './types';
import { useFormControl } from './useFormControl';

export interface Option extends OptionBase {
  label: string;
  value: string;
}

export type SelectFieldProps = BasicField & {
  options: Array<Option>;
  isLoading?: boolean;
};

export const SelectField = forwardRef<SelectFieldProps, 'input'>(
  (props, ref) => {
    const { isLoading, options } = props;
    const { formControlProps, meta, label, helpers } = useFormControl(props);

    const handleChange = useCallback(
      (
        newValue: OnChangeValue<Option, false>,
        actionMeta: ActionMeta<Option>
      ) => {
        helpers.setValue(newValue?.value);
      },
      [helpers]
    );

    const defaultValue = useMemo(() => {
      return options
        ? options.find((option) => option.value === meta.value)
        : undefined;
    }, [meta.value, options]);

    return (
      <FormControl {...formControlProps}>
        {label && <FormLabel htmlFor={formControlProps.id}>{label}</FormLabel>}
        <Select
          ref={ref}
          isLoading={isLoading}
          options={options}
          onChange={handleChange}
          defaultValue={defaultValue}
          classNamePrefix="select-field"
        />
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    );
  }
);
