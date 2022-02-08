import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import run from '@rollup/plugin-run';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const dev = process.env.ROLLUP_WATCH === 'true';

const plugins = [
  resolve({ preferBuiltins: true }),
  typescript({
    exclude: ['**/*.spec.ts', '**/jest.config.ts'],
  }),
  commonjs(),
];

const output = {
  dir: 'dist',
  format: 'esm',
};

export default [
  {
    input: ['server.ts'],
    output,
    plugins: [...plugins, dev && run()],
    external,
  },
  {
    input: ['db/migrate.ts'],
    output,
    plugins,
    external,
  },
];
