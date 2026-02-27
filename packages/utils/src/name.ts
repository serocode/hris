export function generateFullName({
	firstName,
	lastName,
	middleName,
	suffix,
}: {
	firstName: string
	lastName: string
	middleName?: string
	suffix?: string
}): string {
	const m = middleName ? ` ${middleName.charAt(0)}.` : ""
	const s = suffix ? ` ${suffix}` : ""
	return `${firstName}${m} ${lastName}${s}`.trim()
}
