import React from 'react';
import {
  Button,
  InputGroup,
  InputRightElement,
  useDisclosure,
} from '@chakra-ui/react';
import { StringField, StringFieldProps } from './StringField';

export type PasswordFieldProps = StringFieldProps;

export const PasswordField: React.FC<PasswordFieldProps> = (props) => {
  const { isDisabled } = props;
  const { isOpen: show, onToggle } = useDisclosure();

  return (
    <InputGroup size="md">
      <StringField {...props} type={show ? 'text' : 'password'} />
      <InputRightElement width="4.5rem">
        <Button
          h="1.75rem"
          size="sm"
          isDisabled={isDisabled}
          onClick={onToggle}
        >
          {show ? 'Hide' : 'Show'}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
};
