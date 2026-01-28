import type { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import {
  BadRequestErrorRoute,
  ConflictErrorRoute,
  createBadRequestResponse,
  createConflictResponse,
  createNotFoundResponse,
  createServerErrorResponse,
  createSuccessResponse,
  NotFoundErrorRoute,
  ServerErrorRoute,
  UnauthorizedErrorRoute,
} from '@hris-v2/api-routes';
import {
  EmployeesCreatePayload,
  EmployeesCreateResponse,
} from '@hris-v2/api-routes/employees';
import postgres from 'postgres';
import { POSTGRES_ERR } from '@/constants/common';
import { employees } from '@/schema/employees';
import type { App } from '@/types/index';
import { formatDate, runAwait } from '@/utils/common';

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

export function createEmployeeRoute(app: App, employeeRoute: OpenAPIHono) {
  const db = app.db;

  employeeRoute.openapi(route, async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user');
    const logger = c.get('logger');

     logger.info(
      { 
        userId: user.id, 
        userEmail: user.email,
        employeeNumber: body.employeeNumber 
      },
      'Creating employee'
    );

    console.log(`User ${user.email} is creating employee ${body.employeeNumber}`);
    
    const [createdEmployee, err] = await runAwait(
      db
        .insert(employees)
        .values({
          id: crypto.randomUUID(),
          userId: body.userId || user.id,
          employeeNumber: body.employeeNumber,
          firstName: body.firstName,
          lastName: body.lastName,
          position: body.position,
          hireDate: formatDate(body.hireDate),
        })
        .returning(),
    );
    
    if (err) {
      if (err instanceof postgres.PostgresError) {
        switch (err.constraint_name) {
          case POSTGRES_ERR.employees_employeeNumber_unique:
            return c.json(
              createBadRequestResponse(null, [
                {
                  message: `Employee number ${body.employeeNumber} already exists`,
                },
              ]),
              400,
            ) as never;
          case POSTGRES_ERR.employees_userId_unique:
            return c.json(
              createConflictResponse([
                {
                  message: `Employee record already exists for this user`,
                },
              ]),
              409,
            ) as never;
          case POSTGRES_ERR.employees_userId_fkey:
            return c.json(
              createNotFoundResponse([
                {
                  message: `User not found`,
                },
              ]),
              404,
            ) as never;
          default:
            return c.json(createBadRequestResponse(err), 400) as never;
        }
      }
      return c.json(
        createServerErrorResponse(err instanceof Error ? err : new Error(String(err))), 
        500
      ) as never;
    }
    
    return c.json(
      createSuccessResponse({
        id: createdEmployee[0].id,
        userId: createdEmployee[0].userId,
        employeeNumber: createdEmployee[0].employeeNumber,
        firstName: createdEmployee[0].firstName,
        lastName: createdEmployee[0].lastName,
        position: createdEmployee[0].position,
        hireDate: createdEmployee[0].hireDate,
      }),
      201,
    );
  });
}