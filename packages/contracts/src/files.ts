import { z } from "zod"

export const MAX_15MB = 1024 * 1024 * 15
export const MAX_5MB = 5 * 1024 * 1024
export const MAX_10MB = 10 * 1024 * 1024
export const MAX_25MB = 25 * 1024 * 1024

export const IMAGE_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"]

export const WORD_TYPES = [
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export const EXCEL_TYPES = [
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

export const POWERPOINT_TYPES = [
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
]

export const PDF_TYPES = ["application/pdf"]

export const TEXT_TYPES = ["text/plain", "text/csv"]

export const ARCHIVE_TYPES = [
	"application/zip",
	"x-zip-compressed",
	"application/x-tar",
	"application/x-7z-compressed",
]

export const DOCUMENT_TYPES = [
	...WORD_TYPES,
	...EXCEL_TYPES,
	...POWERPOINT_TYPES,
	...PDF_TYPES,
	...TEXT_TYPES,
]

export const ACCEPTED_FILE_TYPES = [
	...DOCUMENT_TYPES,
	...ARCHIVE_TYPES,
	...IMAGE_FILE_TYPES,
]

export const fileTypes = ["file", "folder"] as const
export const fileTypeEnumSchema = z.enum(fileTypes)
export type FileType = z.infer<typeof fileTypeEnumSchema>

export interface FileSchemaOptions {
	acceptedTypes: string[]
	maxSize: number
}

export function createFileSchema({
	acceptedTypes,
	maxSize,
}: FileSchemaOptions) {
	return z
		.instanceof(File)
		.refine(
			(file) => file.size <= maxSize,
			`File size cannot exceed ${(maxSize / 1024 / 1024).toFixed(0)}MB`,
		)
		.refine(
			(file) => acceptedTypes.includes(file.type),
			`File type must be one of: ${acceptedTypes.join(", ")}`,
		)
}

export const imageFileSchema = createFileSchema({
	acceptedTypes: IMAGE_FILE_TYPES,
	maxSize: MAX_15MB,
})

export const documentFileSchema = createFileSchema({
	acceptedTypes: DOCUMENT_TYPES,
	maxSize: MAX_15MB,
})

export const anyAcceptedFileSchema = createFileSchema({
	acceptedTypes: ACCEPTED_FILE_TYPES,
	maxSize: MAX_15MB,
})
