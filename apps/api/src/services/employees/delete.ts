import { employeeRepository } from '@/repositories/employees';
import { getById } from './get';

export const delete_ = async (id: string) => {
  const employee = await getById(id);
  await employeeRepository.delete(id);
  return {
    success: true,
    data: employee,
  };
};
