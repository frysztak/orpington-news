import React from 'react';
import {
  Box,
  Center,
  FormControl,
  FormLabel,
  forwardRef,
  Icon,
  IconButton,
  InputProps,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { BsQuestion } from '@react-icons/all-files/bs/BsQuestion';
import { BasicField, useFormControl } from '@components/forms';
import { CollectionIconType } from '@orpington-news/shared';
import { CollectionIconPicker } from './CollectionIconPicker';
import { getCollectionIcon } from '@components/sidebar/CollectionIcon';

export type CollectionIconFieldProps = BasicField & Omit<InputProps, 'value'>;

const ErrorTooltip = forwardRef<{ error?: string }, 'div'>(
  ({ error, children }, ref) => {
    if (!error) {
      return (
        <Box ml={4} ref={ref}>
          {children}
        </Box>
      );
    }

    return (
      <Tooltip label={error} isOpen placement="bottom" ref={ref}>
        {children}
      </Tooltip>
    );
  }
);

export const CollectionIcon: React.FC<{ icon?: CollectionIconType }> = ({
  icon,
}) => {
  const bg = useColorModeValue('gray.200', 'gray.500');
  return (
    <Center borderRadius="full" h={10} w={10} minW={10} backgroundColor={bg}>
      <Icon as={icon ? getCollectionIcon(icon) : BsQuestion} />
    </Center>
  );
};

export const CollectionIconField: React.FC<CollectionIconFieldProps> = (
  props
) => {
  const { formControlProps, inputProps, meta, helpers, label } =
    useFormControl(props);
  const { isDisabled } = formControlProps;
  const { value } = inputProps;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSelect = (icon: CollectionIconType) => {
    helpers.setValue(icon);
    onClose();
  };

  return (
    <FormControl {...formControlProps}>
      {label && <FormLabel htmlFor={formControlProps.id}>{label}</FormLabel>}
      <Popover variant="ghost" isOpen={isOpen} onClose={onClose} isLazy>
        <PopoverTrigger>
          <ErrorTooltip error={meta.touched ? meta.error : ''}>
            <IconButton
              aria-label="Select feed icon"
              icon={<CollectionIcon icon={value} />}
              variant="bare"
              isDisabled={isDisabled}
              onClick={onOpen}
            />
          </ErrorTooltip>
        </PopoverTrigger>
        <PopoverContent w={72} maxH={80}>
          <CollectionIconPicker
            overflowY="auto"
            overflowX="hidden"
            onIconSelected={handleSelect}
          />
        </PopoverContent>
      </Popover>
    </FormControl>
  );
};
