import { serve } from '@hono/node-server';
import { Scalar } from '@scalar/hono-api-reference';
import { Queue } from 'bullmq';
import close from 'close-with-grace';
import { cors } from 'hono/cors';
import { ALLOWED_ORIGINS, API_PORT } from '@/constants/env';
import { MAIL_QUEUE } from '@/constants/queue';
import { auth } from '@/lib/auth';
import { db, pg } from '@/lib/database';
import { createHonoApp } from '@/lib/hono';
import { connection, redisClient } from '@/lib/redis';
import { contentTypeValidator } from '@/middlewares/content-type';
import { healthCheck, livenessProbe, readinessProbe } from '@/middlewares/health';
import { getLogger, loggerMiddleware } from '@/middlewares/logger';
import { notFound } from '@/middlewares/not-found';
import { onError } from '@/middlewares/on-error';
import { requestSizeLimit } from '@/middlewares/request-size';
import type { App } from '@/types';
import { services } from '@/utils/service';
import { v1Routes } from '@/v1';
import { shutdownMailWorker } from '@/workers';

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
      origin: ALLOWED_ORIGINS,
      credentials: true,
    }),
  );

  // Content-Type validation for POST/PUT/PATCH requests
  openAPIHono.use(contentTypeValidator());

  // Request size limit (10MB max)
  openAPIHono.use(requestSizeLimit());

  openAPIHono.notFound(notFound);
  openAPIHono.onError(onError);
  openAPIHono.use(loggerMiddleware);

  // Register security scheme for OpenAPI
  openAPIHono.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
  });

  // Health check endpoints
  openAPIHono.get('/', (c) => {
    return c.json({ status: 'ok', message: 'HRIS API is running' });
  });
  openAPIHono.get('/health', healthCheck());
  openAPIHono.get('/health/live', livenessProbe());
  openAPIHono.get('/health/ready', readinessProbe());

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
    
    // Close Redis connection
    try {
      await redisClient.quit();
      logger.info('Redis connection closed gracefully');
    } catch (error) {
      logger.error({ error }, 'Failed to close Redis connection');
    }
    
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

      // Register Redis
      svcs.add({
        name: 'redis',
        shutdown: async () => {
          await redisClient.quit();
        },
      });

      // Register Mail Worker
      svcs.add({
        name: 'mail-worker',
        shutdown: shutdownMailWorker,
      });

      logger.info(
        `🚀 Server is running on http://${info.address}:${info.port}`,
      );
    },
  );
}

init().catch((err) => {
  logger.error({ error: err.message, stack: err.stack }, 'Failed to start server');
  process.exit(1);
});