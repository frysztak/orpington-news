import React, { useCallback } from 'react';
import { Icon, IconProps } from '@chakra-ui/react';
import { BsChevronRight } from 'react-icons/bs';

export type ChevronProps = {
  pointTo: 'top' | 'bottom';
  onClick?: () => void;
} & Omit<IconProps, 'css'>;

export const Chevron: React.FC<ChevronProps> = (props) => {
  const { pointTo, onClick, ...rest } = props;

  const handleClick: React.MouseEventHandler = useCallback(
    (event) => {
      event.stopPropagation();
      onClick?.();
    },
    [onClick]
  );

  return (
    <Icon
      as={BsChevronRight}
      transform={`rotate(${pointTo === 'top' ? 0 : 90}deg)`}
      transition="transform 0.2s"
      onClick={handleClick}
      {...rest}
    />
  );
};
