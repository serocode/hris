import { createMiddleware } from 'hono/factory';
import pino from 'pino';
import { LOG_LEVEL, NODE_ENV } from '@/constants/env';

const logger = pino({
  formatters: {
    level: (label: string) => ({ level: label }),
  },
  level: LOG_LEVEL,
  transport:
    NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          },
        },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'request.body[*].password',
    ],
  },
});

export const loggerMiddleware = createMiddleware(async (c, next) => {
  const reqId = c.get('requestId');
  const startTime = performance.now();

  const requestLogger = logger.child({
    reqId,
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
    headers: {
      'user-agent': c.req.header('user-agent'),
      'content-type': c.req.header('content-type'),
      ip: c.req.header('x-forwarded-for'),
    },
  });

  c.set('logger', requestLogger);

  try {
    await next();

    requestLogger.debug({
      session: c.get('sessionId') || null,
      status: c.res.status,
      elapsed: `${Math.round(performance.now() - startTime)}ms`,
    }, 'Request completed');
  } catch (error) {
    requestLogger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      status: c.res.status,
      elapsed: `${Math.round(performance.now() - startTime)}ms`,
    }, 'Request failed');
    throw error;
  }
});

export const getLogger = () => logger;