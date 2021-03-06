import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyAuth from '@fastify/auth';
import fastifyCors from '@fastify/cors';
import fastifyETag from '@fastify/etag';
import fastifySchedule from '@fastify/schedule';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { FastifySSEPlugin } from 'fastify-sse-v2';
import closeWithGrace from 'close-with-grace';
import connectPgSimple from 'connect-pg-simple';

import { auth, collections, preferences, sse } from '@routes';
import { fastifyVerifySession } from '@plugins';
import { fetchRSSJob, pingJob } from '@tasks';
import { logger, readEnvVariable } from '@utils';
import { buildDsn } from '@db';
import { migrator } from '@db/migrator';

const fastify = Fastify({
  logger: logger,
}).withTypeProvider<TypeBoxTypeProvider>();

const PostgresStore = connectPgSimple(fastifySession as any);

const getCookieSecret = (): string => {
  try {
    return readEnvVariable('COOKIE_SECRET', { fileFallback: true });
  } catch (err) {
    logger.warn('COOKIE_SECRET not found, using default value.');
    return 'C9+YT8xJAaz5lppSeC/s/gZ2bitWCLRTUg8SOCYQe4k=';
  }
};

async function setupFastify() {
  await fastify.register(fastifySwagger, {
    routePrefix: '/openapi',
    openapi: {
      info: {
        title: 'Orpington News API',
        version: '0.1.0',
      },
      tags: [
        { name: 'Collections' },
        { name: 'CollectionItem' },
        { name: 'Auth' },
      ],
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

  await fastify.register(fastifyCookie);
  await fastify.register(fastifySession, {
    secret: getCookieSecret(),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
    store: new PostgresStore({
      conString: buildDsn(),
    }) as any,
    rolling: true,
  });

  await fastify.register(fastifyCors, {
    credentials: true,
    origin: [readEnvVariable('APP_URL')],
  });
  await fastify.register(fastifyETag);
  await fastify.register(fastifyAuth);
  await fastify.register(fastifyVerifySession);
  await fastify.register(fastifySchedule);
  await fastify.register(FastifySSEPlugin);

  await fastify.register(auth, { prefix: '/auth' });
  await fastify.register(collections, { prefix: '/collections' });
  await fastify.register(sse, { prefix: '/events' });
  await fastify.register(preferences, { prefix: '/preferences' });

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

  await migrator.up();
  await fastify.ready();

  fastify.scheduler.addSimpleIntervalJob(fetchRSSJob);
  fastify.scheduler.addSimpleIntervalJob(pingJob);
  await fastify.listen(
    {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
      host: process.env.HOST || '0.0.0.0',
    },
    (err, address) => {
      if (err) {
        fastify.log.error(err);
        process.exit(1);
      }
    }
  );
}

(async () => {
  try {
    await setupFastify();
  } catch (err) {
    logger.error(err);
  }
})();
