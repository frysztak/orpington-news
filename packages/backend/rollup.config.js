import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import multiInput from 'rollup-plugin-multi-input';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

export default [
  {
    input: ['server.ts', 'db/migrate.ts', 'routes/**/*.ts'],
    output: {
      dir: 'dist',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: '.',
      exports: 'auto',
    },
    plugins: [
      resolve({ preferBuiltins: true }),
      typescript({
        exclude: ['**/*.spec.ts', '**/jest.config.ts'],
      }),
      commonjs(),
      multiInput({
        relative: 'routes/',
      }),
    ],
    external,
  },
];
