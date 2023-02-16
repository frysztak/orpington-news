import React from 'react';
import cx from 'classnames';

export const Spinner: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cx('spinner', className)} />;
};
