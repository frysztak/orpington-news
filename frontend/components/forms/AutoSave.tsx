import { useEffect } from 'react';
import { useFormikContext } from 'formik';
import { usePrevious } from '@chakra-ui/react';
import { equals } from 'rambda';

export const AutoSave = () => {
  const { values, submitForm } = useFormikContext();
  const previousValues = usePrevious<any>(values);

  useEffect(() => {
    if (
      previousValues &&
      Object.keys(previousValues).length &&
      !equals(previousValues, values)
    ) {
      submitForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  return null;
};
