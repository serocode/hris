import type { EmployeesCreatePayload } from '@hris-v2/api-routes/employees';
import { ServiceError } from '@/lib/service-error';
import { employeeRepository } from '@/repositories/employees';
import { formatDate } from '@/utils/common';

export const createEmployee = async (
  payload: EmployeesCreatePayload,
  authenticatedUserId: string,
) => {
  try {
    const employee = await employeeRepository.createEmployee({
      id: crypto.randomUUID(),
      userId: payload.userId || authenticatedUserId,
      employeeNumber: payload.employeeNumber,
      firstName: payload.firstName,
      lastName: payload.lastName,
      position: payload.position,
      hireDate: formatDate(payload.hireDate),
    });

    return {
      success: true,
      data: employee,
    };
  } catch (err) {
    if (err instanceof ServiceError) {
      throw err;
    }
    throw new ServiceError(
      'DATABASE_ERROR',
      err instanceof Error ? err.message : 'Unknown error occurred',
      500,
    );
  }
};
