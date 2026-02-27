import type { EmployeesDetailsResponse } from "@hris-v2/contracts/employees"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { employeesApi } from "../employees.api"
import { employeesKeys } from "../employees.keys"
import type { UpdateEmployeeInput } from "../employees.schemas"

type UpdateEmployeeMutationInput = {
	id: string
	input: UpdateEmployeeInput
}

export function useUpdateEmployeeMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({ id, input }: UpdateEmployeeMutationInput) =>
			employeesApi.update(id, input),
		onSuccess: (response) => {
			queryClient.setQueryData<EmployeesDetailsResponse>(
				employeesKeys.detail(response.data.id),
				(current) => (current ? { ...current, data: response.data } : current),
			)

			queryClient.invalidateQueries({
				queryKey: employeesKeys.lists(),
			})
		},
	})
}
