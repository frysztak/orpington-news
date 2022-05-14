import React from 'react';
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  forwardRef,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
} from '@chakra-ui/react';
import EyeIcon from '@heroicons/react/solid/EyeIcon';
import EyeOffIcon from '@heroicons/react/solid/EyeOffIcon';
import { useFormControl } from './useFormControl';
import type { StringFieldProps } from './StringField';

export type PasswordFieldProps = StringFieldProps;

export const PasswordField = forwardRef<PasswordFieldProps, 'input'>(
  (props, ref) => {
    const { isDisabled } = props;
    const { formControlProps, inputProps, meta, label, helperText } =
      useFormControl(props);
    const { isOpen: show, onToggle } = useDisclosure();

    return (
      <FormControl {...formControlProps}>
        {label && <FormLabel htmlFor={formControlProps.id}>{label}</FormLabel>}

        <InputGroup size="md">
          <Input {...inputProps} type={show ? 'text' : 'password'} ref={ref} />
          <InputRightElement mr={2}>
            <IconButton
              aria-label={show ? 'Hide password' : 'Show password'}
              isDisabled={isDisabled}
              onClick={onToggle}
              size="xs"
              icon={
                show ? <EyeOffIcon height="100%" /> : <EyeIcon height="100%" />
              }
              variant="ghost"
            />
          </InputRightElement>
        </InputGroup>

        {formControlProps.isInvalid ? (
          <FormErrorMessage>{meta.error}</FormErrorMessage>
        ) : (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }
);
