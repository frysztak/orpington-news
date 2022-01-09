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
    '*::-webkit-scrollbar': {
      width: 2,
    },
    '*::-webkit-scrollbar-track': {
      borderRadius: 'md',
      '@media (prefers-color-scheme: dark)': {
        bgColor: 'gray.700',
      },
      '@media (prefers-color-scheme: light)': {
        bgColor: 'gray.200',
      },
    },
    '*::-webkit-scrollbar-thumb': {
      borderRadius: 'md',
      '@media (prefers-color-scheme: dark)': {
        bgColor: 'gray.500',
      },
      '@media (prefers-color-scheme: light)': {
        bgColor: 'gray.300',
      },
    },
    '*::-webkit-scrollbar-button': {
      display: 'none',
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
