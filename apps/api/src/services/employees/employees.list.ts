import { employeeRepository } from "@/repositories/employees"

export const listEmployees = async (limit?: number, offset?: number) => {
	return employeeRepository.listEmployees(limit, offset)
}
