import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

export default {
  input: ['src/index.ts'],
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    exports: 'named',
  },
  plugins: [
    typescript({
      exclude: ['**/*.spec.ts', '**/jest.config.ts'],
    }),
  ],
  external,
};
