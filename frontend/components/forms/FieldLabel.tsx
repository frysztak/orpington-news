import React from 'react';
import { HStack, FormLabel, Icon, Text, Tooltip } from '@chakra-ui/react';
import { CgInfo } from '@react-icons/all-files/cg/CgInfo';

export interface FieldLabelProps {
  id: string;
  label?: string;
  labelTooltip?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = (props) => {
  const { id, label, labelTooltip } = props;

  if (!label) {
    return null;
  }

  return (
    <FormLabel htmlFor={id} mt={labelTooltip ? 1 : undefined}>
      {labelTooltip ? (
        <Tooltip label={labelTooltip} aria-label="Tooltip">
          <HStack spacing={2}>
            <Text>{label}</Text>
            <Icon as={CgInfo} color="purple.300" />
          </HStack>
        </Tooltip>
      ) : (
        label
      )}
    </FormLabel>
  );
};
