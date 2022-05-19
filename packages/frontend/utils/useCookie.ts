import { useCallback, useEffect, useState } from 'react';
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import { CookieSerializeOptions } from 'next/dist/server/web/types';

export const useCookie = <T>(key: string, initialValue: T) => {
  const readValue = useCallback(() => {
    try {
      const cookies = parseCookies();
      return key in cookies ? (JSON.parse(cookies[key]) as T) : initialValue;
    } catch (err) {
      console.warn(
        `Error reading cookie '${key}':`,
        err,
        `returning ${initialValue}`
      );
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState(readValue);
  const handleSetCookie = useCallback(
    (value: T, options?: CookieSerializeOptions) => {
      setStoredValue(value);
      setCookie(null, key, JSON.stringify(value), options);
    },
    [key]
  );

  useEffect(() => {
    if (initialValue && readValue() === undefined) {
      handleSetCookie(initialValue);
    }
  }, [handleSetCookie, initialValue, key, readValue]);

  const handleRemoveCookie = useCallback(
    (options?: CookieSerializeOptions) => {
      destroyCookie(null, key, options);
    },
    [key]
  );

  return [storedValue, handleSetCookie, handleRemoveCookie] as const;
};
