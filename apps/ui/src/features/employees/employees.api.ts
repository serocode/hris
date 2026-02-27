import {
	EmployeesDeleteResponse,
	EmployeesDetailsResponse,
	EmployeesListResponse,
	EmployeesUpdateResponse,
} from "@hris-v2/contracts/employees"
import { provisioningApi } from "@/features/provisioning/api/provisioning.api"
import { http } from "@/lib/http"
import {
	type CreateEmployeeInput,
	CreateEmployeeInputSchema,
	type EmployeesListParams,
	type EmployeesListParamsResolved,
	EmployeesListParamsSchema,
	type UpdateEmployeeInput,
	UpdateEmployeeInputSchema,
} from "./employees.schemas"

function normalizeListParams(
	params?: EmployeesListParams,
): EmployeesListParamsResolved {
	return EmployeesListParamsSchema.parse(params ?? {})
}

export const employeesApi = {
	list(params?: EmployeesListParams) {
		const parsedParams = normalizeListParams(params)
		const query = new URLSearchParams({
			limit: String(parsedParams.limit),
			offset: String(parsedParams.offset),
		})

		return http(`/api/v1/employees?${query.toString()}`, {
			schema: EmployeesListResponse,
		})
	},

	detail(id: string) {
		return http(`/api/v1/employees/${id}`, {
			schema: EmployeesDetailsResponse,
		})
	},

	async create(input: CreateEmployeeInput) {
		const payload = CreateEmployeeInputSchema.parse(input)

		return provisioningApi.provisionUser(payload)
	},

	update(id: string, input: UpdateEmployeeInput) {
		const payload = UpdateEmployeeInputSchema.parse(input)

		return http(`/api/v1/employees/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: payload,
			schema: EmployeesUpdateResponse,
		})
	},

	remove(id: string) {
		return http(`/api/v1/employees/${id}`, {
			method: "DELETE",
			schema: EmployeesDeleteResponse,
		})
	},
}
