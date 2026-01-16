import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode, StatusCode } from 'hono/utils/http-status';
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes';
import { INTERNAL_SERVER_ERROR as SERVER_ERROR_MESSAGE } from 'stoker/http-status-phrases';

export const onError: ErrorHandler = (err, ctx) => {
  const currentStatus =
    'status' in err ? err.status : ctx.newResponse(null).status;

  const statusCode =
    currentStatus !== OK
      ? (currentStatus as StatusCode)
      : INTERNAL_SERVER_ERROR;

  const env = ctx.env?.NODE_ENV || process.env?.NODE_ENV;

  const logger = ctx.get('logger');

  logger.error({
    err,  
    statusCode,
    url: ctx.req.url,
    method: ctx.req.method,
  }, err.message); 

  return ctx.json(
    {
      status: 'error',
      message: SERVER_ERROR_MESSAGE,
      error: err.message,
      stack: env === 'production' ? undefined : err.stack,
    },
    statusCode as ContentfulStatusCode,
  );
};