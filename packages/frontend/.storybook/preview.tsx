import React, { useEffect } from 'react';
import { themes } from '@storybook/theming';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { useDarkMode } from 'storybook-dark-mode';
import { theme } from '../theme';
import { fontFaces } from '../theme/fonts';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: {
    theme: themes.dark,
  },
};

const DarkModeProvider = () => {
  const isDarkMode = useDarkMode();
  const { setColorMode } = useColorMode();

  useEffect(() => {
    setColorMode(isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return null;
};

export const decorators = [
  (Story) => (
    <ChakraProvider theme={theme}>
      <Global styles={fontFaces} />
      <DarkModeProvider />
      <Story />
    </ChakraProvider>
  ),
];
