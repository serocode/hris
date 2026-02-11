import type { EmployeesUpdatePayload } from '@hris-v2/api-routes/employees';
import { ServiceError } from '@/lib/service-error';
import { employeeRepository } from '@/repositories/employees';
import { formatDate } from '@/utils/common';

export const updateEmployee = async (
  id: string,
  payload: EmployeesUpdatePayload,
) => {
  try {
    const { hireDate,  ...rest } = payload;

    const updateData: Partial<{
      firstName: string;
      lastName: string;
      position: string;
      hireDate: string;
    }> = {
      ...rest,
      ...(hireDate !== undefined && { hireDate: formatDate(hireDate) }),
    };

    const updated = await employeeRepository.updateEmployee(id, updateData);

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
