import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone.js"
import utc from "dayjs/plugin/utc.js"

/**
 * Runs a promise and returns a tuple of the result and error.
 */
export function runAwait<T, U = Error>(
	promise: Promise<T>,
): Promise<[T, null] | [null, U]> {
	return promise
		.then<[T, null]>((data) => [data, null])
		.catch<[null, U]>((err) => [null, err])
}

dayjs.extend(utc)
dayjs.extend(timezone)

export function formatDate(
	date: Date | string,
	format = "YYYY-MM-DD",
	tz = "Asia/Manila",
) {
	return dayjs(date).tz(tz).format(format)
}
