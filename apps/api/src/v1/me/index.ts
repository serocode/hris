import { createRoute } from '@hono/zod-openapi';
import {
  createSuccessResponse,
  NotFoundErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import { MeResponse } from '@hris-v2/api-routes/me';
import { createHonoApp } from '@/lib/hono';
import { sessionCheck } from '@/middlewares/session';
import { userService } from '@/services/users';
import type { App } from '@/types';
import { formatDate } from '@/utils/common';

const route = createRoute({
  tags: ['me'],
  summary: 'Get own profile',
  method: 'get',
  path: '/',
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [sessionCheck],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MeResponse,
        },
      },
      description: 'User profile retrieved successfully',
    },
    ...UnauthorizedErrorRoute,
    ...NotFoundErrorRoute,
    ...ServerErrorRoute,
  },
});

export function meRoutes(_app: App) {
  const meRoute = createHonoApp();

  meRoute.openapi(route, async (c) => {
    const user = c.get('user');
    const logger = c.get('logger');

    logger.info(
      {
        userId: user.id,
        userEmail: user.email,
      },
      'Fetching user profile',
    );

    const employee = await userService.getProfile(user.id);

    logger.info(
      {
        employeeId: employee.id,
      },
      'User profile retrieved successfully',
    );

    return c.json(
      createSuccessResponse({
        id: employee.id,
        userId: employee.userId,
        employeeNumber: user.name, // This is employee_number
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        hireDate: formatDate(employee.hireDate),
        createdAt: employee.createdAt
          ? formatDate(employee.createdAt, 'YYYY-MM-DDTHH:mm:ssZ')
          : '',
        updatedAt: employee.updatedAt
          ? formatDate(employee.updatedAt, 'YYYY-MM-DDTHH:mm:ssZ')
          : '',
      }),
      200,
    );
  });

  return meRoute;
}
