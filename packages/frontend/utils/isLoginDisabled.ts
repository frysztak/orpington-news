import getConfig from 'next/config';

const config = getConfig();

export const isLoginDisabled = () =>
  Boolean(config?.publicRuntimeConfig.APP_DISABLE_LOGIN);
