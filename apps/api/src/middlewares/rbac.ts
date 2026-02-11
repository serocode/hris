import { createForbiddenResponse } from '@hris-v2/api-routes';
import { createMiddleware } from 'hono/factory';
import { auth } from '@/lib/auth';

type PermissionRecord = Record<string, string[]>;

export const requirePermission = (permissions: PermissionRecord) =>
  createMiddleware(async (c, next) => {
    const user = c.get('user');

    if (!user?.role) {
      return c.json(
        createForbiddenResponse([{ message: 'Forbidden' }]),
        403,
      );
    }

    const result = await auth.api.userHasPermission({
      body: {
        userId: user.id,
        permissions,
      },
    });

    if (!result.success) {
      return c.json(
        createForbiddenResponse([{ message: 'Insufficient permissions' }]),
        403,
      );
    }

    await next();
  });
