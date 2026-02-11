export type { EmployeeRecord } from '@/schema/employees';
export { createEmployee } from './employees.create';
export { deleteEmployee } from './employees.delete';
export {
  getEmployeeById,
  getEmployeeByUserId,
} from './employees.get';
export { listEmployees } from './employees.list';
export { updateEmployee } from './employees.update';

import { createEmployee } from './employees.create';
import { deleteEmployee } from './employees.delete';
import {
  getEmployeeById,
  getEmployeeByUserId,
} from './employees.get';
import { listEmployees } from './employees.list';
import { updateEmployee } from './employees.update';

export const employeeRepository = {
  createEmployee,
  getEmployeeById,
  getEmployeeByUserId,
  listEmployees,
  updateEmployee,
  deleteEmployee,
};
