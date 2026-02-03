import { employeeRepository } from '@/repositories/employees';

export const employeeNumberExists = async (employeeNumber: string): Promise<boolean> => {
  const employee = await employeeRepository.getEmployeeByEmployeeNumber(employeeNumber);
  return !!employee;
};

export const userHasEmployee = async (userId: string): Promise<boolean> => {
  const employee = await employeeRepository.getEmployeeByUserId(userId);
  return !!employee;
};
