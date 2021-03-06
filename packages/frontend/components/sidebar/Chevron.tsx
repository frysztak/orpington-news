import React from 'react';
import { Icon, IconProps } from '@chakra-ui/react';
import { BsChevronRight } from '@react-icons/all-files/bs/BsChevronRight';

export type ChevronProps = {
  pointTo: 'top' | 'bottom';
} & Omit<IconProps, 'css'>;

export const Chevron: React.FC<ChevronProps> = (props) => {
  const { pointTo, ...rest } = props;

  return (
    <Icon
      as={BsChevronRight}
      transform={`rotate(${pointTo === 'top' ? 0 : 90}deg)`}
      transition="transform 0.2s"
      {...rest}
    />
  );
};
