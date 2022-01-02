import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const base = {
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.spec.ts', '**/jest.config.ts'],
    }),
    commonjs(),
  ],
  external,
};

export default [
  {
    input: ['src/index.ts'],
    output: {
      format: 'esm',
      file: pkg.module,
      sourcemap: true,
    },
    ...base,
  },
  {
    input: ['src/index.ts'],
    output: {
      format: 'cjs',
      file: pkg.main,
      sourcemap: true,
    },
    ...base,
  },
];
