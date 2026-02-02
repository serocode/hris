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
  EmployeesUpdateParams,
  EmployeesUpdatePayload,
  EmployeesUpdateResponse,
} from '@hris-v2/api-routes/employees';
import { employeeService } from '@/services/employees';
import type { App } from '@/types/index';
import { formatDate } from '@/utils/common';

const route = createRoute({
  tags: ['employees'],
  summary: 'Update an employee',
  method: 'patch',
  path: '/{id}',
  request: {
    params: EmployeesUpdateParams,
    body: {
      content: {
        'application/json': {
          schema: EmployeesUpdatePayload,
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
    200: {
      content: {
        'application/json': {
          schema: EmployeesUpdateResponse,
        },
      },
      description: 'Employee updated successfully',
    },
    ...BadRequestErrorRoute,
    ...UnauthorizedErrorRoute,
    ...NotFoundErrorRoute,
    ...ConflictErrorRoute,
    ...ServerErrorRoute,
  },
});

export function updateEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
  employeeRoute.openapi(route, async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    const user = c.get('user');
    const logger = c.get('logger');

    logger.info(
      {
        userId: user.id,
        userEmail: user.email,
        employeeId: id,
        updates: body,
      },
      'Updating employee',
    );

    const result = await employeeService.update(id, body);

    logger.info(
      {
        employeeId: result.data.id,
        employeeNumber: result.data.employeeNumber,
      },
      'Employee updated successfully',
    );

    return c.json(
      createSuccessResponse({
        id: result.data.id,
        userId: result.data.userId,
        employeeNumber: result.data.employeeNumber,
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        position: result.data.position,
        hireDate: formatDate(result.data.hireDate),
        createdAt: result.data.createdAt
          ? formatDate(result.data.createdAt, 'YYYY-MM-DDTHH:mm:ssZ')
          : '',
        updatedAt: result.data.updatedAt
          ? formatDate(result.data.updatedAt, 'YYYY-MM-DDTHH:mm:ssZ')
          : '',
      }),
    );
  });
}
