import { ServiceError } from '@/lib/service-error';
import { employeeRepository } from '@/repositories/employees';

export const getEmployeeById = async (id: string) => {
  const employee = await employeeRepository.getEmployeeById(id);
  if (!employee) {
    throw new ServiceError(
      'EMPLOYEE_NOT_FOUND',
      'Employee not found',
      404,
    );
  }
  return employee;
};

export const getEmployeeByEmployeeNumber = async (employeeNumber: string) => {
  const employee = await employeeRepository.getEmployeeByEmployeeNumber(employeeNumber);
  if (!employee) {
    throw new ServiceError(
      'EMPLOYEE_NOT_FOUND',
      `Employee with number ${employeeNumber} not found`,
      404,
    );
  }
  return employee;
};

export const getEmployeeByUserId = async (userId: string) => {
  const employee = await employeeRepository.getEmployeeByUserId(userId);
  if (!employee) {
    throw new ServiceError(
      'EMPLOYEE_NOT_FOUND',
      `No employee record found for user ${userId}`,
      404,
    );
  }
  return employee;
};
