import dayjs from 'dayjs';

/**
 * Runs a promise and returns a tuple of the result and error.
 */
export function runAwait<T, U = Error>(
  promise: Promise<T>,
): Promise<[T, null] | [null, U]> {
  return promise
    .then<[T, null]>((data) => [data, null])
    .catch<[null, U]>((err) => [null, err]);
}

export function formatDate(date: Date, format = 'YYYY-MM-DD') {
  return dayjs(date).format(format);
}
