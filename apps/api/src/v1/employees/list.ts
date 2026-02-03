import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  BadRequestErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import {
  EmployeesListQuery,
  EmployeesListResponse,
} from '@hris-v2/api-routes/employees';
import { employeeService } from '@/services/employees';
import type { App } from '@/types/index';
import { formatDate } from '@/utils/common';

const route = createRoute({
  tags: ['employees'],
  summary: 'List employees',
  method: 'get',
  path: '/',
  request: {
    query: EmployeesListQuery,
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
          schema: EmployeesListResponse,
        },
      },
      description: 'Employees retrieved successfully',
    },
    ...BadRequestErrorRoute,
    ...UnauthorizedErrorRoute,
    ...ServerErrorRoute,
  },
});

export function listEmployeesRoute(_app: App, employeeRoute: OpenAPIHono) {
  employeeRoute.openapi(route, async (c) => {
    const { limit, offset } = c.req.valid('query');
    const user = c.get('user');
    const logger = c.get('logger');

    logger.debug(
      {
        userId: user.id,
        userEmail: user.email,
        limit,
        offset,
      },
      'Listing employees',
    );

    const { data: employees, total } = await employeeService.listEmployees(limit, offset);

    logger.debug(
      {
        count: employees.length,
        total,
        limit,
        offset,
      },
      'Employees retrieved successfully',
    );

    const mappedData = employees.map((employee) => ({
      id: employee.id,
      userId: employee.userId,
      employeeNumber: employee.employeeNumber,
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
    }));

    const meta = {
      limit,
      offset,
      total,
    };

    return c.json(
      {
        status: 'success' as const,
        data: mappedData,
        meta,
      },
      200,
    );
  });
}
