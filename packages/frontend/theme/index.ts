import { colors } from './colors';
import {
  extendTheme,
  withDefaultColorScheme,
  withDefaultSize,
} from '@chakra-ui/react';
import { textStyles } from './textStyles';
import { fonts } from './fonts';
import { Button, Menu } from './components';

const styles = {
  global: {
    '*': {
      scrollbarWidth: 'thin',
    },
    //'*::-webkit-scrollbar': {
    //  width: "12px",
    //  height: "12px",
    //},
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
    components: {
      Menu,
      Button,
    },
  },
  withDefaultColorScheme({ colorScheme: 'purple' }),
  withDefaultSize({
    size: 'lg',
    components: ['Button'],
  })
);
