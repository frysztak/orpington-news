const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
module.exports = {
  stories: ['../**/*.stories.mdx', '../**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@chakra-ui/storybook-addon',
    '@storybook/addon-styling',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      fastRefresh: true,
    },
  },
  staticDirs: ['../public'],
  features: {
    emotionAlias: false,
    postcss: false,
  },
  typescript: {
    reactDocgen: false,
  },
  webpackFinal: async (config) => {
    config.resolve.plugins = [
      ...(config.resolve.plugins || []),
      new TsconfigPathsPlugin({
        extensions: config.resolve.extensions,
      }),
    ];
    return config;
  },
  docs: {
    autodocs: true,
  },
};
