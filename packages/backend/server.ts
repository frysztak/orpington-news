import Fastify from 'fastify';
import fastifySwagger from 'fastify-swagger';
import fastifyCookie from 'fastify-cookie';
import fastifySession from '@fastify/session';
import fastifyAuth from 'fastify-auth';
import fastifyCors from 'fastify-cors';
import fastifySchedule from 'fastify-schedule';
import fastifySplitValidator from 'fastify-split-validator';
import { FastifySSEPlugin } from 'fastify-sse-v2';
import closeWithGrace from 'close-with-grace';

import { auth, collectionItem, collections, sse } from '@routes';
import { fastifyVerifySession } from '@plugins';
import { fetchRSSJob } from '@tasks/fetchRSS';
import { defaultAjv, logger } from '@utils';
import { migrator } from '@db/migrator';
import { isLoginDisabled } from '@orpington-news/shared';

const disableAppLogin = isLoginDisabled();

const fastify = Fastify({
  logger: logger,
});

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

  if (!disableAppLogin) {
    if (!process.env.COOKIE_SECRET) {
      throw new Error(`COOKIE_SECRET not set!`);
    }

    await fastify.register(fastifyCookie);
    await fastify.register(fastifySession, {
      secret: process.env.COOKIE_SECRET,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
      rolling: true,
    });
  }

  if (!process.env.APP_URL) {
    throw new Error(`APP_URL not set!`);
  }

  await fastify.register(fastifyCors, {
    credentials: true,
    origin: [process.env.APP_URL],
  });
  await fastify.register(fastifyAuth);
  await fastify.register(fastifyVerifySession);
  await fastify.register(fastifySchedule);
  await fastify.register(fastifySplitValidator, {
    defaultValidator: defaultAjv,
  });
  await fastify.register(FastifySSEPlugin);

  await fastify.register(auth, { prefix: '/auth' });
  await fastify.register(collections, { prefix: '/collections' });
  await fastify.register(collectionItem, { prefix: '/collectionItem' });
  await fastify.register(sse, { prefix: '/events' });

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
  await migrator.repair();
  await fastify.ready();

  fastify.scheduler.addSimpleIntervalJob(fetchRSSJob);
  await fastify.listen(
    process.env.PORT || 5000,
    process.env.HOST || '0.0.0.0',
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
