import webpack from 'webpack';
import path from 'path';
import { URL } from 'url';
import { createRequire } from 'module';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import nodeExternals from 'webpack-node-externals';
import NodemonPlugin from 'nodemon-webpack-plugin';

const require = createRequire(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

const isDev = process.env.NODE_ENV === 'development';
const prodExternals = ['argon2', 'pg-native', 'canvas', 'pino', 'pino-pretty'];

export default {
  mode: isDev ? 'development' : 'production',
  entry: {
    server: './server.ts',
    ...(isDev
      ? {
          migrate: './db/migrate.ts',
        }
      : {}),
  },
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
    new NodemonPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /^canvas$/,
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^pg-native$/,
    }),
    new webpack.NormalModuleReplacementPlugin(
      /^hexoid$/,
      require.resolve('hexoid/dist/index.js')
    ),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    chunkFormat: 'module',
    clean: true,
  },
  experiments: {
    outputModule: true,
  },
  node: {
    __dirname: 'mock',
  },
};
