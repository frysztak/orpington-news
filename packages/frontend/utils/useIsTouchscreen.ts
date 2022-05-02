import { useMediaQuery } from '@chakra-ui/react';

export const useIsTouchscreen = () => {
  const [isTouchscreen] = useMediaQuery('(hover: none)');
  return isTouchscreen;
};
