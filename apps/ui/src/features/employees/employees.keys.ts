import type { EmployeesListParamsResolved } from "./employees.schemas"

export const employeesKeys = {
	all: ["employees"] as const,
	lists: () => [...employeesKeys.all, "list"] as const,
	list: (params: EmployeesListParamsResolved) =>
		[...employeesKeys.lists(), params] as const,
	detail: (id: string) => [...employeesKeys.all, "detail", id] as const,
}
