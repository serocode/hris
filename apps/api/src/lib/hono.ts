import { OpenAPIHono } from "@hono/zod-openapi";
import type {ValidationError} from '@hris-v2/api-routes/errors';
import { UNPROCESSABLE_ENTITY } from "stoker/http-status-phrases";

export const createHonoApp = () =>
  new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json<ValidationError>(
          {
            status: 'error',
            message: UNPROCESSABLE_ENTITY,
            error: {
              issues: result.error.issues.map((issue) => ({
                message: issue.message,
                path: issue.path,
              })),
            },
          },
          422,
        );
      }
    },
  });

