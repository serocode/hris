import { QueueEvents, Worker } from "bullmq"
import nodemailer from "nodemailer"
import { NODE_ENV, SMTP_HOST, SMTP_PORT } from "@/constants/env"
import { MAIL_QUEUE } from "@/constants/queue"
import { connection } from "@/lib/redis"
import { getLogger } from "@/middlewares/logger"

const logger = getLogger()

/**
 * Mail job data structure for BullMQ
 */
export type MailJobData = {
	to: string
	subject: string
	text?: string
	html?: string
	from?: string
}

/**
 * Queue events for monitoring mail queue status
 */
const queueEvents = new QueueEvents(MAIL_QUEUE, {
	connection,
})

queueEvents.on("failed", ({ jobId, failedReason }) => {
	logger.error(`Mail job ${jobId} failed: ${failedReason}`)
})

queueEvents.on("completed", ({ jobId }) => {
	logger.info(`Mail job ${jobId} completed successfully`)
})

/**
 * Nodemailer transporter configuration
 * Uses secure connection in production, plain in development
 */
const transporter = nodemailer.createTransport({
	host: SMTP_HOST,
	port: SMTP_PORT,
	secure: NODE_ENV === "production",
})

/**
 * Mail worker that processes email jobs from the queue.
 * Handles sending emails via nodemailer with proper logging and error handling.
 */
export const mailWorker = new Worker<MailJobData>(
	MAIL_QUEUE,
	async (job) => {
		const { to, subject, text, html, from } = job.data

		logger.info(
			{ jobId: job.id, to, subject },
			"Processing mail job",
		)

		try {
			const result = await transporter.sendMail({
				from: from || "noreply@hris.localhost",
				to,
				subject,
				text,
				html,
			})

			logger.info(
				{ jobId: job.id, messageId: result.messageId },
				"Mail sent successfully",
			)

			return result
		} catch (error) {
			logger.error(
				{
					jobId: job.id,
					error: error instanceof Error ? error.message : String(error),
				},
				"Failed to send mail",
			)
			throw error
		}
	},
	{
		connection,
		concurrency: 5, // Process up to 5 emails concurrently
	},
)

mailWorker.on("failed", (job, err) => {
	logger.error(
		{ jobId: job?.id, error: err.message, stack: err.stack },
		"Mail worker job failed",
	)
})

mailWorker.on("completed", (job) => {
	logger.debug({ jobId: job.id }, "Mail worker job completed")
})

mailWorker.on("error", (error) => {
	logger.error({ error: error.message }, "Mail worker error")
})

/**
 * Gracefully shut down the mail worker.
 * Waits for active jobs to complete before closing.
 */
export async function shutdownMailWorker(): Promise<void> {
	logger.info("Shutting down mail worker...")
	await mailWorker.close()
	await queueEvents.close()
	logger.info("Mail worker shut down complete")
}