import { employeeRepository } from '@/repositories/employees';

export const userHasEmployee = async (userId: string): Promise<boolean> => {
  const employee = await employeeRepository.getEmployeeByUserId(userId);
  return !!employee;
};
