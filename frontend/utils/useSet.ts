import { useCallback, useState } from 'react';

export const useSet = <T>(initialValues?: Array<T>) => {
  const [set, setSet] = useState<Set<T>>(new Set<T>(initialValues ?? []));

  const add = useCallback((val: Array<T> | T) => {
    setSet((oldSet) => {
      const newSet = new Set(oldSet);
      if (Array.isArray(val)) {
        for (const x of val) {
          newSet.add(x);
        }
      } else {
        newSet.add(val);
      }

      return newSet;
    });
  }, []);

  const remove = useCallback((val: Array<T> | T) => {
    setSet((oldSet) => {
      const newSet = new Set(oldSet);
      if (Array.isArray(val)) {
        for (const x of val) {
          newSet.delete(x);
        }
      } else {
        newSet.delete(val);
      }

      return newSet;
    });
  }, []);

  const setValue = useCallback((newSet: Set<T>) => {
    setSet(newSet);
  }, []);

  return { set, add, remove, setValue };
};
