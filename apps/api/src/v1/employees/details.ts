import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  BadRequestErrorRoute,
  createSuccessResponse,
  NotFoundErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import {
  EmployeesDetailsParams,
  EmployeesDetailsResponse,
} from '@hris-v2/api-routes/employees';
import { employeeService } from '@/services/employees';
import type { App } from '@/types/index';
import { formatDate } from '@/utils/common';

const route = createRoute({
  tags: ['employees'],
  summary: 'Get employee by ID',
  method: 'get',
  path: '/{id}',
  request: {
    params: EmployeesDetailsParams,
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
          schema: EmployeesDetailsResponse,
        },
      },
      description: 'Employee retrieved successfully',
    },
    ...BadRequestErrorRoute,
    ...UnauthorizedErrorRoute,
    ...NotFoundErrorRoute,
    ...ServerErrorRoute,
  },
});

export function getEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
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
      'Getting employee by ID',
    );

    const employee = await employeeService.getById(id);

    logger.info(
      {
        employeeId: employee.id,
        employeeNumber: employee.employeeNumber,
      },
      'Employee retrieved successfully',
    );

    return c.json(
      createSuccessResponse({
        id: employee.id,
        userId: employee.userId,
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        hireDate: formatDate(employee.hireDate),
        createdAt: employee.createdAt ? formatDate(employee.createdAt, 'YYYY-MM-DDTHH:mm:ssZ') : '',
        updatedAt: employee.updatedAt ? formatDate(employee.updatedAt, 'YYYY-MM-DDTHH:mm:ssZ') : '',
      }),
    );
  });
}
