import React from 'react';
import {
  FormControl,
  FormLabel,
  HStack,
  useRadioGroup,
} from '@chakra-ui/react';
import { BasicField } from './types';
import { useFormControl } from './useFormControl';

export type RadioFieldProps = BasicField & {
  children: (args: {
    getRadioProps: ReturnType<typeof useRadioGroup>['getRadioProps'];
  }) => React.ReactNode;
};

export const RadioGroupField: React.FC<RadioFieldProps> = (props) => {
  const { label, children } = props;
  const { formControlProps, meta, helpers } = useFormControl(props);

  const onChange = (value: string) => {
    helpers.setValue(value);
  };

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: formControlProps.id,
    defaultValue: meta.value,
    onChange,
  });

  const group = getRootProps();

  return (
    <FormControl {...formControlProps}>
      {label && (
        <FormLabel
          htmlFor={formControlProps.id}
          fontWeight="bold"
          fontSize="lg"
          fontFamily="heading"
        >
          {label}
        </FormLabel>
      )}
      <HStack {...group} spacing={4}>
        {children({ getRadioProps })}
      </HStack>
    </FormControl>
  );
};
