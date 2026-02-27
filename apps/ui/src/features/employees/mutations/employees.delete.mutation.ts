import type { EmployeesListResponse } from "@hris-v2/contracts/employees"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { QueryDataTuple } from "@/app/providers/query-client"
import { employeesApi } from "../employees.api"
import { employeesKeys } from "../employees.keys"

type DeleteContext = {
	previousLists: QueryDataTuple<EmployeesListResponse>[]
}

export function useDeleteEmployeeMutation() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (employeeId: string) => employeesApi.remove(employeeId),
		onMutate: async (employeeId): Promise<DeleteContext> => {
			await queryClient.cancelQueries({ queryKey: employeesKeys.lists() })

			const previousLists = queryClient.getQueriesData<EmployeesListResponse>({
				queryKey: employeesKeys.lists(),
			})

			queryClient.setQueriesData<EmployeesListResponse>(
				{ queryKey: employeesKeys.lists() },
				(current) => {
					if (!current) return current

					return {
						...current,
						data: current.data.filter((employee) => employee.id !== employeeId),
						meta: {
							...current.meta,
							total: Math.max(0, current.meta.total - 1),
						},
					}
				},
			)

			return { previousLists }
		},
		onError: (_error, _employeeId, context) => {
			context?.previousLists.forEach(([queryKey, previousData]) => {
				queryClient.setQueryData(queryKey, previousData)
			})
		},
		onSuccess: (_, employeeId) => {
			queryClient.removeQueries({
				queryKey: employeesKeys.detail(employeeId),
			})
		},
		onSettled: () => {
			queryClient.invalidateQueries({
				queryKey: employeesKeys.all,
			})
		},
	})
}
