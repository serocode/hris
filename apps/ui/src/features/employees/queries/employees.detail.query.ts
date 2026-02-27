import { useQuery } from "@tanstack/react-query"
import { employeesApi } from "../employees.api"
import { employeesKeys } from "../employees.keys"

export function useEmployeeQuery(employeeId: string) {
	return useQuery({
		queryKey: employeesKeys.detail(employeeId),
		queryFn: () => employeesApi.detail(employeeId),
		enabled: Boolean(employeeId),
	})
}
