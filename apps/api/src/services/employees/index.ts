export { createEmployee } from "./employees.create"
export { deleteEmployee } from "./employees.delete"
export { userHasEmployee } from "./employees.exists"
export {
	getEmployeeById,
	getEmployeeByUserId,
} from "./employees.get"
export { listEmployees } from "./employees.list"
export { updateEmployee } from "./employees.update"

import { createEmployee } from "./employees.create"
import { deleteEmployee } from "./employees.delete"
import { userHasEmployee } from "./employees.exists"
import { getEmployeeById, getEmployeeByUserId } from "./employees.get"
import { listEmployees } from "./employees.list"
import { updateEmployee } from "./employees.update"

export const employeeService = {
	createEmployee,
	getEmployeeById,
	getEmployeeByUserId,
	listEmployees,
	updateEmployee,
	deleteEmployee,
	userHasEmployee,
}
