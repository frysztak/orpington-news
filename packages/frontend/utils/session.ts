import type { GetServerSidePropsContext } from 'next';

export const getSessionIdFromRequest = (
  req: GetServerSidePropsContext['req']
) => {
  const sessionId = req.cookies['sessionId'] ?? '';
  return {
    Cookie: `sessionId=${sessionId}`,
  };
};
