import {
	QueryClient,
	QueryClientProvider,
	type QueryKey,
} from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useState } from "react"
import { ApiError } from "@/lib/api-error"

function shouldRetry(failureCount: number, error: unknown): boolean {
	if (error instanceof ApiError) {
		if ([400, 401, 403, 404, 422].includes(error.status)) {
			return false
		}
	}
	return failureCount < 2
}

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60_000,
				gcTime: 5 * 60_000,
				retry: shouldRetry,
				refetchOnWindowFocus: false,
			},
			mutations: {
				retry: shouldRetry,
			},
		},
	})
}

export function AppQueryProvider({
	children,
}: Readonly<{ children: ReactNode }>) {
	const [queryClient] = useState(createQueryClient)
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

export type QueryDataTuple<TData> = readonly [QueryKey, TData | undefined]
