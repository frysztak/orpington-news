import React, { useState } from 'react';
import useDidMount from 'beautiful-react-hooks/useDidMount';

export const ClientRender: React.FC = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useDidMount(() => {
    setIsMounted(true);
  });
  return isMounted ? (children as JSX.Element) : null;
};
