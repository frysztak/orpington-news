import { useField } from 'formik';
import { BasicField } from './types';

export function useFormControl<T extends BasicField>(props: T) {
  const { name, id, ...rest } = props;
  const { isRequired, isDisabled } = rest;

  const [field, meta, helpers] = useField(name);
  const { error, touched } = meta;

  return {
    formControlProps: {
      id: id || name,
      isRequired: isRequired || false,
      isInvalid: !!error && touched,
      isDisabled,
    },
    inputProps: { ...field, ...rest },

    meta,
    helpers,
  };
}
