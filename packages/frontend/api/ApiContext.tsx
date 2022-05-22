import { createContext, useContext, useMemo } from 'react';
import type { Wretcher } from 'wretch';
import { getUrls, makeApi } from '@api';
import { ReactFCC } from '@utils/react';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export interface ApiContextData {
  api: Wretcher;
}

const ApiContext = createContext<ApiContextData | null>(null);

export const ApiContextProvider: ReactFCC = ({ children }) => {
  const onUnauthorized = useHandleUnauthorized();
  const { apiUrl } = useMemo(() => getUrls(), []);

  const api = useMemo(() => {
    return makeApi(apiUrl).catcher(401, onUnauthorized);
  }, [apiUrl, onUnauthorized]);

  return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
};

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error(`useApiContext needs to wrapped in ApiContextProvider`);
  }

  return context;
};

export const useApi = () => {
  return useApiContext().api;
};
