import { createContext, useContext, useMemo } from 'react';
import type { Wretcher } from 'wretch';
import { makeApi } from '@api';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export interface ApiContextData {
  api: Wretcher;
}

const ApiContext = createContext<ApiContextData | null>(null);

export const ApiContextProvider: React.FC = ({ children }) => {
  const onUnauthorized = useHandleUnauthorized();

  const api = useMemo(() => {
    return makeApi().catcher(401, onUnauthorized);
  }, [onUnauthorized]);

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
