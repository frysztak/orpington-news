import type { GetServerSidePropsContext } from 'next';

export const getCookieHeaderFromReq = (
  req: GetServerSidePropsContext['req']
) => {
  const cookies = req.headers.cookie ?? '';
  return {
    Cookie: cookies,
  };
};

const chakraColorModeCookieName = 'chakra-ui-color-mode';
export const getChakraColorModeCookie = (
  req: GetServerSidePropsContext['req']
): string => {
  if (chakraColorModeCookieName in req.cookies) {
    return `${chakraColorModeCookieName}=${req.cookies[chakraColorModeCookieName]}`;
  }
  return '';
};
