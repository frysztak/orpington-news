import React, { useCallback } from 'react';
import {
  FormLabel,
  FormControl,
  FormErrorMessage,
  forwardRef,
  InputProps,
  VStack,
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { Avatar } from '@components/sidebar';
import { file2Base64 } from '@utils';
import { BasicField } from './types';
import { useFormControl } from './useFormControl';

export type AvatarFieldProps = BasicField &
  Omit<InputProps, 'value'> & {
    displayName: string;
  };

export const AvatarField = forwardRef<AvatarFieldProps, 'input'>(
  (props, ref) => {
    const { displayName } = props;
    const { formControlProps, meta, label, helpers } = useFormControl(props);

    const handleDrop = useCallback(
      (files: File[]) => {
        if (files.length) {
          const file = files[0];
          file2Base64(file).then((base64: string) => helpers.setValue(base64));
        }
      },
      [helpers]
    );

    const handleDelete = useCallback(() => {
      helpers.setValue(undefined);
    }, [helpers]);

    const { open } = useDropzone({
      onDrop: handleDrop,
      accept: {
        'image/*': ['.jpeg', '.png', '.gif', '.webp', '.avif'],
      },
      noDrag: true,
      noClick: true,
    });

    return (
      <FormControl {...formControlProps}>
        {label && <FormLabel htmlFor={formControlProps.id}>{label}</FormLabel>}
        <VStack align="center">
          <Avatar
            name={displayName}
            src={meta.value}
            avatarStyle="initials"
            badge={Boolean(meta.value) ? 'delete' : 'upload'}
            onOpenAvatarSelection={open}
            onDeleteAvatar={handleDelete}
          />
        </VStack>
        <FormErrorMessage>{meta.error}</FormErrorMessage>
      </FormControl>
    );
  }
);
