import type {
	MeResponse as MeResponseType,
	MeUpdatePayload,
	MeUpdateResponse as MeUpdateResponseType,
} from "@hris-v2/contracts/me"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { profileApi } from "./profile.api"
import { profileKeys } from "./profile.keys"

type UseMeQueryOptions = {
	enabled?: boolean
}

export function useMeQuery(options?: UseMeQueryOptions) {
	return useQuery<MeResponseType>({
		queryKey: profileKeys.me(),
		queryFn: () => profileApi.get(),
		enabled: options?.enabled ?? true,
	})
}

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient()

	return useMutation<MeUpdateResponseType, unknown, MeUpdatePayload>({
		mutationFn: (input: MeUpdatePayload) => profileApi.update(input),
		onSuccess: (response) => {
			queryClient.setQueryData(profileKeys.me(), response)
		},
	})
}
