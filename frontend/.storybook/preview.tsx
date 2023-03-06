import React from 'react';
import { themes } from '@storybook/theming';
import { addDecorator } from '@storybook/react';
import { Global } from '@emotion/react';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';
import { RouterContext } from 'next/dist/shared/lib/router-context';
// import { withPerformance } from 'storybook-addon-performance';
import { theme } from '../theme';
import { fontFaces } from '../theme/fonts';
import '../styles/global.scss';

// addDecorator(withPerformance);

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
  chakra: {
    theme,
  },
};

export const decorators = [
  (Story) => (
    <DndProvider backend={HTML5Backend}>
      <Global styles={fontFaces} />
      <Story />
    </DndProvider>
  ),
];
