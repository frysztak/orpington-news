import { colors } from './colors';
import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultSize,
} from '@chakra-ui/react';
import { textStyles } from './textStyles';
import { fonts } from './fonts';

const styles = {
  global: {
    '*': {
      scrollbarWidth: 'thin',
    },
    '*::-webkit-scrollbar': {
      width: 1,
      height: 1,
    },
  },
};

const fontSizes = {
  '2xs': '8px',
};

export const theme = extendTheme(
  {
    useSystemColorMode: true,
    initialColorMode: 'system',
    fonts,
    colors,
    styles,
    fontSizes,
    textStyles,
  },
  withDefaultColorScheme({ colorScheme: 'purple' }),
  withDefaultSize({
    size: 'lg',
    components: ['Button'],
  })
);
