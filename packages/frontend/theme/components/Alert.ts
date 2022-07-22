import { alertAnatomy as parts } from '@chakra-ui/anatomy';
import { mode } from '@chakra-ui/theme-tools';
import type { PartsStyleFunction } from '@chakra-ui/theme-tools';

const variantSolid: PartsStyleFunction<typeof parts> = (props) => {
  const { status, colorScheme: c } = props;

  if (status === 'info') {
    return {
      container: {
        bg: mode(`purple.300`, `purple.50`)(props),
        color: mode(`white`, `gray.900`)(props),
      },
    };
  }

  return {
    container: {
      bg: mode(`${c}.500`, `${c}.200`)(props),
      color: mode(`white`, `gray.900`)(props),
    },
  };
};

export const Alert = {
  variants: {
    solid: variantSolid,
  },
};
