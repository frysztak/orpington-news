/* istanbul ignore file */

import type { FastifyPluginAsync } from 'fastify';

export const coverage: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get('/', { schema: {} }, (request, reply) => {
    return global.__coverage__ ? { coverage: global.__coverage__ } : null;
  });
};
