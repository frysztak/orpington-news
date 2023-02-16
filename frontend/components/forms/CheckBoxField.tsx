import React, { ChangeEvent } from 'react';
import { Checkbox, FormControl, FormErrorMessage } from '@chakra-ui/react';
import { omit } from 'rambda';
import { BasicField } from './types';
import { useFormControl } from './useFormControl';

export type CheckBoxFieldProps = BasicField & {
  label: JSX.Element | string;
};

const filterInputProps = omit(['onBlur', 'onChange']);

export function CheckBoxField(props: CheckBoxFieldProps) {
  const { label } = props;
  const { formControlProps, inputProps, meta, helpers } = useFormControl(props);

  const onChange = (value: ChangeEvent<HTMLInputElement>) => {
    helpers.setTouched(true);
    helpers.setValue(value.currentTarget.checked);
  };

  return (
    <FormControl {...formControlProps}>
      <Checkbox
        {...filterInputProps(inputProps)}
        isChecked={!!meta.value}
        onChange={onChange}
      >
        {label}
      </Checkbox>
      <FormErrorMessage>{meta.error}</FormErrorMessage>
    </FormControl>
  );
}
