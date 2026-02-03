import { eq } from 'drizzle-orm';
import postgres from 'postgres';
import { POSTGRES_ERR } from '@/constants/common';
import { db } from '@/lib/database';
import { ServiceError } from '@/lib/service-error';
import { type EmployeeRecord, employees } from '@/schema/employees';

export const updateEmployee = async (
  id: string,
  data: Partial<Omit<EmployeeRecord, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<EmployeeRecord> => {
  try {
    const [updated] = await db
      .update(employees)
      .set(data)
      .where(eq(employees.id, id))
      .returning();

    if (!updated) {
      throw new ServiceError(
        'EMPLOYEE_NOT_FOUND',
        'Employee not found',
        404,
      );
    }

    return updated;
  } catch (err) {
    const pgError =
      (err && typeof err === 'object' && 'cause' in err && err.cause instanceof postgres.PostgresError)
        ? err.cause
        : err instanceof postgres.PostgresError
        ? err
        : null;

    if (pgError) {
      switch (pgError.constraint_name) {
        case POSTGRES_ERR.employees_employeeNumber_unique:
          throw new ServiceError(
            'EMPLOYEE_NUMBER_EXISTS',
            `Employee number already exists`,
            400,
          );
        case POSTGRES_ERR.employees_userId_unique:
          throw new ServiceError(
            'EMPLOYEE_EXISTS_FOR_USER',
            'Employee record already exists for this user',
            409,
          );
        case POSTGRES_ERR.employees_userId_fkey:
          throw new ServiceError(
            'USER_NOT_FOUND',
            'User not found',
            404,
          );
        default:
          throw new ServiceError(
            'DATABASE_ERROR',
            pgError.message || 'Database error occurred',
            500,
          );
      }
    }

    throw err;
  }
};
