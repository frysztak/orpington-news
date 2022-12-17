import React from 'react';
import cx from 'classnames';

type Props = React.ComponentProps<'button'>;

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props} className={cx('btn')}>
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export const IconButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ children, className, ...props }, ref) => (
    <button ref={ref} {...props} className={cx('btn p-2', className)}>
      {children}
    </button>
  )
);
IconButton.displayName = 'IconButton';
