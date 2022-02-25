import React, { useEffect } from 'react';
import { themes } from '@storybook/theming';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { useDarkMode } from 'storybook-dark-mode';
import { DndProvider } from 'react-dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
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
      <DndProvider options={HTML5toTouch}>
        <Global styles={fontFaces} />
        <DarkModeProvider />
        <Story />
      </DndProvider>
    </ChakraProvider>
  ),
];
