import { employeeRepository } from '@/repositories/employees';

export const list = async (limit?: number, offset?: number) => {
  return employeeRepository.list(limit, offset);
};
