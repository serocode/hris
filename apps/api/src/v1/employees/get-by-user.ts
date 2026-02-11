import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute, z } from '@hono/zod-openapi';
import {
  BadRequestErrorRoute,
  createSuccessResponse,
  ForbiddenErrorRoute,
  NotFoundErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import {
  EmployeesDetailsResponse,
} from '@hris-v2/api-routes/employees';
import { requirePermission } from '@/middlewares/rbac';
import { employeeService } from '@/services/employees';
import type { App } from '@/types/index';
import { formatDate } from '@/utils/common';

const route = createRoute({
  tags: ['employees'],
  summary: 'Get employee by user ID',
  method: 'get',
  path: '/by-user-id/{userId}',
  request: {
    params: z.object({
      userId: z.string().openapi({ example: 'adt819234masdf1m' }),
    }),
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [requirePermission({ user: ['list'] })],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: EmployeesDetailsResponse,
        },
      },
      description: 'Employee retrieved successfully',
    },
    ...BadRequestErrorRoute,
    ...UnauthorizedErrorRoute,
    ...ForbiddenErrorRoute,
    ...NotFoundErrorRoute,
    ...ServerErrorRoute,
  },
});

export function getEmployeeByUserIdRoute(_app: App,employeeRoute: OpenAPIHono) {
  employeeRoute.openapi(route, async (c) => {
    const { userId } = c.req.valid('param');
    const user = c.get('user');
    const logger = c.get('logger');

    logger.info(
      {
        userId: user.id,
        userEmail: user.email,
        targetUserId: userId,
      },
      'Getting employee by user ID',
    );

    const employee = await employeeService.getEmployeeByUserId(userId);

    logger.info(
      {
        employeeId: employee.id,
      },
      'Employee retrieved successfully',
    );

    return c.json(
      createSuccessResponse({
        id: employee.id,
        userId: employee.userId,
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
    );
  });
}
