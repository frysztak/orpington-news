import { useUpdateEffect } from 'usehooks-ts';

export interface FieldListenerProps<T extends unknown> {
  value: T;
  cb?: (x: T) => void;
}

export const FieldListener = <T,>(props: FieldListenerProps<T>) => {
  const { value, cb } = props;

  useUpdateEffect(() => {
    cb?.(value);
  }, [cb, value]);

  return null;
};
