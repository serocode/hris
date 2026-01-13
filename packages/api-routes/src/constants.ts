import { z } from "@hono/zod-openapi"

export const MAX_FILE_SIZE = 1024 * 1024 * 15 // 15MB

export const IMAGE_FILE_TYPES = ["image/png", "image/jpeg", "image/webp"]

export const ACCEPTED_FILE_TYPES = [
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/pdf",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/plain",
	"text/csv",
	"application/vnd.ms-powerpoint",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/zip",
	"x-zip-compressed",
	"application/x-tar",
	"application/x-7z-compressed",
	...IMAGE_FILE_TYPES,
]

export const fileTypes = ["file", "folder"] as const
export const fileTypeEnumSchema = z.enum(fileTypes)
