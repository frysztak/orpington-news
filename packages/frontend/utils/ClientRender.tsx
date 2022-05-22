import { ReactFCC } from '@utils/react';
import { useIsClient } from 'usehooks-ts';

export const ClientRender: ReactFCC = ({ children }) => {
  const isClient = useIsClient();
  return isClient ? (children as JSX.Element) : null;
};
