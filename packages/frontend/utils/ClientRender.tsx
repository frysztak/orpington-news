import React from 'react';
import { useIsClient } from 'usehooks-ts';

export const ClientRender: React.FC = ({ children }) => {
  const isClient = useIsClient();
  return isClient ? (children as JSX.Element) : null;
};
