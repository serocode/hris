import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  BadRequestErrorRoute,
  ConflictErrorRoute,
  createSuccessResponse,
  ForbiddenErrorRoute,
  NotFoundErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import {
  EmployeesCreatePayload,
  EmployeesCreateResponse,
} from '@hris-v2/api-routes/employees';
import { requirePermission } from '@/middlewares/rbac';
import { employeeService } from '@/services/employees';
import type { App } from '@/types/index';

const route = createRoute({
  tags: ['employees'],
  summary: 'Create an employee',
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: EmployeesCreatePayload,
        },
      },
    },
  },
  security: [
    {
      Bearer: [],
    },
  ],
  middleware: [requirePermission({ user: ['create'] })],
  responses: {
    201: {
      content: {
        'application/json': {
          schema: EmployeesCreateResponse,
        },
      },
      description: 'Employee created successfully',
    },
    ...BadRequestErrorRoute,
    ...UnauthorizedErrorRoute,
    ...ForbiddenErrorRoute,
    ...NotFoundErrorRoute,
    ...ConflictErrorRoute,
    ...ServerErrorRoute,
  },
});

export function createEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
  employeeRoute.openapi(route, async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user');
    const logger = c.get('logger');

    logger.debug(
      {
        userId: user.id,
        userEmail: user.email,
      },
      'Creating employee',
    );

    const result = await employeeService.createEmployee(body, user.id);

    logger.debug(
      {
        employeeId: result.data.id,
      },
      'Employee created successfully',
    );

    return c.json(
      createSuccessResponse({
        id: result.data.id,
        userId: result.data.userId,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        position: result.data.position,
        hireDate: result.data.hireDate,
      }),
      201,
    );
  });
}