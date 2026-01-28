import { serve } from '@hono/node-server';
import { Scalar } from '@scalar/hono-api-reference';
import { Queue } from 'bullmq';
import close from 'close-with-grace';
import { cors } from 'hono/cors';
import { API_PORT } from '@/constants/env';
import { MAIL_QUEUE } from '@/constants/queue';
import { auth } from '@/lib/auth';
import { db, pg } from '@/lib/database';
import { createHonoApp } from '@/lib/hono';
import { connection } from '@/lib/redis';
import { getLogger, loggerMiddleware } from '@/middlewares/logger';
import { notFound } from '@/middlewares/not-found';
import { onError } from '@/middlewares/on-error';
import type { App } from '@/types';
import { services } from '@/utils/service';
import { v1Routes } from '@/v1';

const logger = getLogger();
const svcs = services();

const mailQueue = new Queue(MAIL_QUEUE, {
  connection,
});

mailQueue.on('error', (error) => {
  logger.error({ error }, 'Mail queue error');
});

async function init() {
  const openAPIHono = createHonoApp();

  openAPIHono.use(
    cors({
      origin: ['http://localhost:5173', 'http://localhost:3000'], 
      credentials: true,
    }),
  );

  openAPIHono.notFound(notFound);
  openAPIHono.onError(onError);
  openAPIHono.use(loggerMiddleware);

  // Register security scheme for OpenAPI
  openAPIHono.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  // Health check
  openAPIHono.get('/', (c) => {
    return c.json({ status: 'ok', message: 'HRIS API is running' });
  });

  // OpenAPI documentation
  openAPIHono.doc('/openapi-doc', (c) => {
    const forwardedProto = c.req.header('x-forwarded-proto') || 'http';
    const forwardedHost = c.req.header('x-forwarded-host');
    const host = forwardedHost || c.req.header('host') || 'localhost';
    return {
      openapi: '3.0.0',
      info: {
        version: '1.0.0',
        title: 'HRIS API',
        description: 'Human Resources Information System API',
      },
      servers: [
        {
           url: `${forwardedProto}://${host}`,
          description: 'Current environment',
        },
      ],
    };
  });

  // Scalar API reference UI
  openAPIHono.get(
    '/docs',
    Scalar({
        url: '/openapi-doc',
      theme: 'alternate',
      layout: 'modern',
      defaultHttpClient: {
        targetKey: 'js',
        clientKey: 'fetch',
      },
    }),
  );

  // App context
  const app: App = {
     openAPIHono,
    pg,
    db,
    mailQueue,
  };

  // Auth routes (public - rate limiting handled by better-auth)
  openAPIHono.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw));

  // API routes
  openAPIHono.route('/api/v1', v1Routes(app));

  // Graceful shutdown
  close(async ({ signal, err, manual }) => {
    if (err) {
      logger.error({ error: err.message, stack: err.stack }, 'Error during shutdown');
    }
    
    await svcs.shutdown();
    
    logger.info(
      `Server stopped with SIGNAL ${signal}. Manual: ${!!manual}`,
    );
    process.exit(err ? 1 : 0);
  });

  // Start server
  serve(
    {
      fetch: openAPIHono.fetch,
      port: API_PORT,
    },
    async (info) => {
      logger.info('Registering services...');
      
      // Register PostgreSQL
      svcs.add({
        name: 'postgres',
        shutdown: async () => {
          await pg.end({ timeout: 5000 });
        },
      });

      logger.info(
        `🚀 Server is running on http://${info.address}:${info.port}`,
      );
      logger.info(`📚 API Documentation: http://localhost:${info.port}/docs`);
      logger.info(`📄 OpenAPI Spec: http://localhost:${info.port}/openapi-doc`);
    },
  );
}

init().catch((err) => {
  logger.error({ error: err.message, stack: err.stack }, 'Failed to start server');
  process.exit(1);
});