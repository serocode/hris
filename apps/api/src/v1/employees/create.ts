import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  BadRequestErrorRoute,
  ConflictErrorRoute,
  createSuccessResponse,
  NotFoundErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import {
  EmployeesCreatePayload,
  EmployeesCreateResponse,
} from '@hris-v2/api-routes/employees';
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

    logger.info(
      {
        userId: user.id,
        userEmail: user.email,
        employeeNumber: body.employeeNumber,
      },
      'Creating employee',
    );

    const result = await employeeService.create(body, user.id);

    logger.info(
      {
        employeeId: result.data.id,
        employeeNumber: body.employeeNumber,
      },
      'Employee created successfully',
    );

    return c.json(
      createSuccessResponse({
        id: result.data.id,
        userId: result.data.userId,
        employeeNumber: result.data.employeeNumber,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        position: result.data.position,
        hireDate: result.data.hireDate,
      }),
      201,
    );
  });
}