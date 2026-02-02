export type { EmployeeRecord } from '@/schema/employees';
export { create } from './create';
export { delete_ } from './delete';
export {
  getByEmployeeNumber,
  getById,
  getByUserId,
} from './get';
export { list } from './list';
export { update } from './update';

import { create } from './create';
import { delete_ } from './delete';
import { getByEmployeeNumber, getById, getByUserId } from './get';
import { list } from './list';
import { update } from './update';

export const employeeRepository = {
  create,
  getById,
  getByEmployeeNumber,
  getByUserId,
  list,
  update,
  delete: delete_,
};
