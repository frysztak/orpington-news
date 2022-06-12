import { build } from 'esbuild';
import { jsdomPlugin } from './jsdom.js';
import { nativeNodeModulesPlugin } from './native-node-module.js';

build({
  entryPoints: ['server.ts'],
  bundle: true,
  minify: true,
  outdir: 'dist',
  outExtension: { '.js': '.cjs' },
  platform: 'node',
  target: ['node16'],
  external: ['argon2', 'pg-native', 'canvas', 'pino'],
  plugins: [jsdomPlugin(), nativeNodeModulesPlugin()],
}).catch((err) => process.exit(1));
