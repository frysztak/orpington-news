import { useEffect } from 'react';

export interface FieldListenerProps<T extends unknown> {
  value: T;
  cb?: (x: T) => void;
}

export const FieldListener = <T,>(props: FieldListenerProps<T>) => {
  const { value, cb } = props;
  useEffect(() => {
    cb?.(value);
  }, [cb, value]);
  return null;
};
