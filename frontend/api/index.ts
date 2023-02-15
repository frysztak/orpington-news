import wretch from 'wretch';
import formDataAddon from 'wretch/addons/formData';
import queryStringAddon from 'wretch/addons/queryString';
import abortAddon from 'wretch/addons/abort';

export const getUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL ?? '/api';
};

export const makeApi = (url: string) =>
  wretch()
    .addon(formDataAddon)
    .addon(queryStringAddon)
    .addon(abortAddon())
    .url(url)
    .options({ credentials: 'include', mode: 'cors' })
    .errorType('json');

export type Wretch = ReturnType<typeof makeApi>;

export * from './ApiContext';
export * from './useHandleError';
export * from './auth';
export * from './collections';
export * from './preferences';
