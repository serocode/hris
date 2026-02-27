import { useQuery } from "@tanstack/react-query"
import { employeesApi } from "../employees.api"
import { employeesKeys } from "../employees.keys"
import {
	type EmployeesListParams,
	EmployeesListParamsSchema,
} from "../employees.schemas"

export function useEmployeesQuery(params?: EmployeesListParams) {
	const parsedParams = EmployeesListParamsSchema.parse(params ?? {})

	return useQuery({
		queryKey: employeesKeys.list(parsedParams),
		queryFn: () => employeesApi.list(parsedParams),
	})
}
