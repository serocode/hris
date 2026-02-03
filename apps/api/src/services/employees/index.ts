export { createEmployee } from './employees.create';
export { deleteEmployee } from './employees.delete';
export {
  employeeNumberExists,
  userHasEmployee,
} from './employees.exists';
export {
  getEmployeeByEmployeeNumber,
  getEmployeeById,
  getEmployeeByUserId,
} from './employees.get';
export { listEmployees } from './employees.list';
export { updateEmployee } from './employees.update';

import { createEmployee } from './employees.create';
import { deleteEmployee } from './employees.delete';
import { employeeNumberExists, userHasEmployee } from './employees.exists';
import {
  getEmployeeByEmployeeNumber,
  getEmployeeById,
  getEmployeeByUserId,
} from './employees.get';
import { listEmployees } from './employees.list';
import { updateEmployee } from './employees.update';

export const employeeService = {
  createEmployee,
  getEmployeeById,
  getEmployeeByEmployeeNumber,
  getEmployeeByUserId,
  listEmployees,
  updateEmployee,
  deleteEmployee,
  employeeNumberExists,
  userHasEmployee,
};
