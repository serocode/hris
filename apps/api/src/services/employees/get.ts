import { ServiceError } from '@/lib/service-error';
import { employeeRepository } from '@/repositories/employees';

export const getById = async (id: string) => {
  const employee = await employeeRepository.getById(id);
  if (!employee) {
    throw new ServiceError(
      'EMPLOYEE_NOT_FOUND',
      'Employee not found',
      404,
    );
  }
  return employee;
};

export const getByEmployeeNumber = async (employeeNumber: string) => {
  const employee = await employeeRepository.getByEmployeeNumber(employeeNumber);
  if (!employee) {
    throw new ServiceError(
      'EMPLOYEE_NOT_FOUND',
      `Employee with number ${employeeNumber} not found`,
      404,
    );
  }
  return employee;
};

export const getByUserId = async (userId: string) => {
  const employee = await employeeRepository.getByUserId(userId);
  if (!employee) {
    throw new ServiceError(
      'EMPLOYEE_NOT_FOUND',
      `No employee record found for user ${userId}`,
      404,
    );
  }
  return employee;
};
