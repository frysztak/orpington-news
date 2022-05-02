import React, { useEffect } from 'react';
import { themes } from '@storybook/theming';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { useDarkMode } from 'storybook-dark-mode';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { RouterContext } from 'next/dist/shared/lib/router-context';
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
  nextRouter: {
    Provider: RouterContext.Provider,
  },
  layout: 'fullscreen',
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
      <DndProvider backend={HTML5Backend}>
        <Global styles={fontFaces} />
        <DarkModeProvider />
        <Story />
      </DndProvider>
    </ChakraProvider>
  ),
];
