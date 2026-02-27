import { useMutation, useQueryClient } from "@tanstack/react-query"
import { employeesApi } from "../employees.api"
import { employeesKeys } from "../employees.keys"
import type { CreateEmployeeInput } from "../employees.schemas"

export function useCreateEmployeeMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (payload: CreateEmployeeInput) => employeesApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: employeesKeys.lists(),
			})
		},
	})
}
