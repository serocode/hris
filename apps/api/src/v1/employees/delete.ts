import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  BadRequestErrorRoute,
  NotFoundErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import {
  EmployeesDeleteParams,
  EmployeesDeleteResponse,
} from '@hris-v2/api-routes/employees';
import { employeeService } from '@/services/employees';
import type { App } from '@/types/index';
import { formatDate } from '@/utils/common';

const route = createRoute({
  tags: ['employees'],
  summary: 'Delete an employee',
  method: 'delete',
  path: '/{id}',
  request: {
    params: EmployeesDeleteParams,
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
          schema: EmployeesDeleteResponse,
        },
      },
      description: 'Employee deleted successfully',
    },
    ...BadRequestErrorRoute,
    ...UnauthorizedErrorRoute,
    ...NotFoundErrorRoute,
    ...ServerErrorRoute,
  },
});

export function deleteEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
  employeeRoute.openapi(route, async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const logger = c.get('logger');

    logger.info(
      {
        userId: user.id,
        userEmail: user.email,
        employeeId: id,
      },
      'Deleting employee',
    );

    const result = await employeeService.delete(id);

    logger.info(
      {
        employeeId: result.data.id,
        employeeNumber: result.data.employeeNumber,
      },
      'Employee deleted successfully',
    );

    return c.json(
      {
        status: 'success' as const,
        data: {
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
        },
        message: 'Employee deleted successfully',
      },
      200,
    );
  });
}
