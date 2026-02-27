import {
	MeResponse,
	type MeResponse as MeResponseType,
	type MeUpdatePayload,
	MeUpdateResponse,
	type MeUpdateResponse as MeUpdateResponseType,
} from "@hris-v2/contracts/me"
import { http } from "@/lib/http"

export const profileApi = {
	get() {
		return http<MeResponseType>("/api/v1/me", {
			schema: MeResponse,
		})
	},

	update(input: MeUpdatePayload) {
		return http<MeUpdateResponseType>("/api/v1/me", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: input,
			schema: MeUpdateResponse,
		})
	},
}
