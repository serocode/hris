import { employeeRepository } from '@/repositories/employees';
import { getEmployeeById } from './employees.get';

export const deleteEmployee = async (id: string) => {
  const employee = await getEmployeeById(id);
  await employeeRepository.deleteEmployee(id);
  return {
    success: true,
    data: employee,
  };
};
