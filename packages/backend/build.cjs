const fs = require('fs');
const jsdomPatch = {
  name: 'jsdom-patch',
  setup(build) {
    build.onLoad(
      { filter: /jsdom\/living\/xhr\/XMLHttpRequest-impl\.js$/ },
      async (args) => {
        let contents = await fs.promises.readFile(args.path, 'utf8');

        contents = contents.replace(
          'const syncWorkerFile = require.resolve ? require.resolve("./xhr-sync-worker.js") : null;',
          `const syncWorkerFile = "${require.resolve(
            'jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js'
          )}";`
        );

        return { contents, loader: 'js' };
      }
    );
  },
};

require('esbuild')
  .build({
    entryPoints: ['server.ts', 'db/migrate.ts'],
    bundle: true,
    minify: true,
    outdir: 'dist',
    outExtension: { '.js': '.cjs' },
    platform: 'node',
    target: ['node16'],
    external: ['argon2', 'pg-native', 'canvas', 'pino'],
    plugins: [jsdomPatch],
  })
  .catch((err) => process.exit(1));
