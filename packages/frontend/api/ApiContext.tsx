import { createContext, useContext, useMemo } from 'react';
import { getUrls, makeApi, Wretch } from '@api';
import { ReactFCC } from '@utils/react';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export interface ApiContextData {
  api: Wretch;
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
