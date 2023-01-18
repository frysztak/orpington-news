import { createContext, useContext, useMemo, useState } from 'react';
import { getUrl, makeApi, Wretch } from '@api';
import { ReactFCC } from '@utils/react';
import { useHandleUnauthorized } from './useHandleUnauthorized';

export interface ApiContextData {
  api: Wretch;
  showAppContent: boolean;
  setShowAppContent: (value: boolean) => void;
}

const ApiContext = createContext<ApiContextData | null>(null);

export const ApiContextProvider: ReactFCC = ({ children }) => {
  const [showAppContent, setShowAppContent] = useState(false);
  const onUnauthorized = useHandleUnauthorized(setShowAppContent);
  const apiUrl = useMemo(() => getUrl(), []);

  const api = useMemo(() => {
    return makeApi(apiUrl).catcher(401, onUnauthorized);
  }, [apiUrl, onUnauthorized]);

  return (
    <ApiContext.Provider value={{ api, showAppContent, setShowAppContent }}>
      {children}
    </ApiContext.Provider>
  );
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
