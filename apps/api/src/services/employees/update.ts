import type { EmployeesUpdatePayload } from '@hris-v2/api-routes/employees';
import { ServiceError } from '@/lib/service-error';
import { employeeRepository } from '@/repositories/employees';
import { formatDate } from '@/utils/common';

export const update = async (
  id: string,
  payload: EmployeesUpdatePayload,
) => {
  try {
    const { hireDate, employeeNumber, ...rest } = payload;

    if (employeeNumber) {
      const existingEmployee = await employeeRepository.getByEmployeeNumber(employeeNumber);
      if (existingEmployee && existingEmployee.id !== id) {
        throw new ServiceError(
          'EMPLOYEE_NUMBER_EXISTS',
          `Employee number ${employeeNumber} already exists`,
          400,
        );
      }
    }

    const updateData: Partial<{
      employeeNumber: string;
      firstName: string;
      lastName: string;
      position: string;
      hireDate: string;
    }> = {
      ...rest,
      ...(employeeNumber !== undefined && { employeeNumber }),
      ...(hireDate !== undefined && { hireDate: formatDate(hireDate) }),
    };

    const updated = await employeeRepository.update(id, updateData);

    return {
      success: true,
      data: updated,
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
