import React from 'react';
import cx from 'classnames';
import { BsChevronRight } from '@react-icons/all-files/bs/BsChevronRight';

export type ChevronProps = {
  pointTo: 'top' | 'bottom';
};

export const Chevron: React.FC<ChevronProps> = ({ pointTo }) => {
  return (
    <span>
      <BsChevronRight
        className={cx('transform transition-transform', {
          'rotate-90': pointTo === 'bottom',
        })}
      />
    </span>
  );
};
