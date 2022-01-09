import Fastify from 'fastify';
import fastifySwagger from 'fastify-swagger';
import fastifyCookie from 'fastify-cookie';
import fastifySession from '@fastify/session';
import fastifyAuth from 'fastify-auth';
import fastifyCors from 'fastify-cors';
import fastifySchedule from 'fastify-schedule';
import fastifySplitValidator from 'fastify-split-validator';
import closeWithGrace from 'close-with-grace';

import { auth, collections } from '@routes';
import { fastifyVerifySession } from '@plugins';
import { fetchRSSJob } from '@tasks/fetchRSS';
import { defaultAjv } from '@utils';

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifySwagger, {
  routePrefix: '/openapi',
  openapi: {
    info: {
      title: 'Orpington News API',
      version: '0.1.0',
    },
    tags: [{ name: 'Collections' }, { name: 'Auth' }],
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

if (!process.env.COOKIE_SECRET) {
  throw new Error(`COOKIE_SECRET not set!`);
}

if (!process.env.APP_URL) {
  throw new Error(`APP_URL not set!`);
}

fastify.register(fastifyCors, {
  credentials: true,
  origin: [process.env.APP_URL],
});
fastify.register(fastifyAuth);
fastify.register(fastifyVerifySession);
fastify.register(fastifyCookie);
fastify.register(fastifySession, {
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
  rolling: true,
});
fastify.register(fastifySchedule);
fastify.register(fastifySplitValidator, { defaultValidator: defaultAjv });

fastify.register(auth, { prefix: '/auth' });
fastify.register(collections, { prefix: '/collections' });

fastify.ready().then(
  () => {
    fastify.scheduler.addSimpleIntervalJob(fetchRSSJob);
  },
  (err) => {
    console.error(err);
  }
);

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
