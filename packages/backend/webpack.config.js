import webpack from 'webpack';
import path from 'path';
import { URL } from 'url';
import { createRequire } from 'module';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import NodemonPlugin from 'nodemon-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';

const require = createRequire(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const isDev = process.env.NODE_ENV === 'development';
const prodExternals = [
  // packages that can't be easily bundled (either native modules, or make use of worker threads)
  'argon2',
  'pino',
  'pino-pretty',
  'tinypool',
  // packages that are not even installed
  {
    long: 'commonjs long',
    'utf-8-validate': 'commonjs utf-8-validate',
    bufferutil: 'commonjs bufferutil',
  },
];

const config = {
  mode: isDev ? 'development' : 'production',
  target: 'node',
  externalsPresets: { node: true },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
  },
  externals: isDev
    ? [
        nodeExternals({
          importType: 'module',
        }),
      ]
    : prodExternals,
  plugins: [
    new ProgressBarPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /^(canvas|pg-native)$/,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /^hexoid$/,
      require.resolve('hexoid/dist/index.js')
    ),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    chunkFormat: 'module',
  },
  experiments: {
    outputModule: true,
  },
  node: {
    __dirname: 'mock',
  },
};

const serverConfig = {
  ...config,
  entry: {
    server: './src/server.ts',
    ...(isDev
      ? {
          migrate: './db/migrate.ts',
        }
      : {}),
  },
  plugins: [...config.plugins, new NodemonPlugin()],
};

const workerConfig = {
  ...config,
  entry: {
    'fetchRSS.worker': './tasks/fetchRSS/worker.ts',
  },
  output: {
    ...config.output,
    library: {
      type: 'module',
    },
  },
};

export default [serverConfig, workerConfig];
