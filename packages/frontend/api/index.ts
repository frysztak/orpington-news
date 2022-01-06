import wretch from 'wretch';

export const api = wretch()
  .url(`${process.env.NEXT_PUBLIC_API_URL}`)
  .options({ credentials: 'include', mode: 'cors' })
  .errorType('json');

export * from './useHandleError';
