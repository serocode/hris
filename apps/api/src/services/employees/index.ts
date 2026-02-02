export { create } from './create';
export { delete_ } from './delete';
export {
  employeeNumberExists,
  userHasEmployee,
} from './exists';
export { getByEmployeeNumber, getById, getByUserId } from './get';
export { list } from './list';
export { update } from './update';

import { create } from './create';
import { delete_ } from './delete';
import { employeeNumberExists, userHasEmployee } from './exists';
import { getByEmployeeNumber, getById, getByUserId } from './get';
import { list } from './list';
import { update } from './update';

export const employeeService = {
  create,
  getById,
  getByEmployeeNumber,
  getByUserId,
  list,
  update,
  delete: delete_,
  employeeNumberExists,
  userHasEmployee,
};
