import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export const isLoginDisabled = () =>
  Boolean(publicRuntimeConfig.APP_DISABLE_LOGIN);
