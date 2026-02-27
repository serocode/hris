export { employeesApi } from "./employees.api"
export { employeesKeys } from "./employees.keys"

export {
	type CreateEmployeeInput,
	CreateEmployeeInputSchema,
	type EmployeesListParams,
	type EmployeesListParamsResolved,
	EmployeesListParamsSchema,
	type UpdateEmployeeInput,
	UpdateEmployeeInputSchema,
} from "./employees.schemas"

export { useCreateEmployeeMutation } from "./mutations/employees.create.mutation"
export { useDeleteEmployeeMutation } from "./mutations/employees.delete.mutation"
export { useUpdateEmployeeMutation } from "./mutations/employees.update.mutation"
export { useEmployeeQuery } from "./queries/employees.detail.query"

export { useEmployeesQuery } from "./queries/employees.list.query"
