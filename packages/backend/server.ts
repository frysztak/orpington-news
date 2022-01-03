import Fastify from 'fastify';
import fastifySwagger from 'fastify-swagger';
import closeWithGrace from 'close-with-grace';
import collections from 'routes/collections';

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      coerceTypes: false,
    },
  },
});

fastify.register(fastifySwagger, {
  routePrefix: '/openapi',
  openapi: {
    info: {
      title: 'Orpington News API',
      version: '0.1.0',
    },
    tags: [{ name: 'Collections' }],
  },
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  exposeRoute: true,
});

fastify.register(collections, { prefix: '/collections' });

const closeListeners = closeWithGrace(
  { delay: 500 },
  async function ({ err }: { err?: any }) {
    if (err) {
      fastify.log.error(err);
    }
    await fastify.close();
  }
);

fastify.addHook('onClose', async (instance, done) => {
  closeListeners.uninstall();
  done();
});

fastify.listen(5000, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
