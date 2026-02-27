import { Queue } from "bullmq"
import { MAIL_QUEUE } from "@/constants/queue"
import { connection } from "@/lib/redis"
import { getLogger } from "@/middlewares/logger"
import type { MailJobData } from "@/workers/mailWorker"

const logger = getLogger()

let mailQueue: Queue<MailJobData> | null = null

export const getMailQueue = () => {
	if (!mailQueue) {
		mailQueue = new Queue<MailJobData>(MAIL_QUEUE, {
			connection,
		})
	}
	return mailQueue
}

export const sendEmail = async ({
	to,
	subject,
	html,
	text,
	from,
}: MailJobData) => {
	try {
		const queue = getMailQueue()
		await queue.add(
			"send-email",
			{ to, subject, html, text, from },
			{
				attempts: 3,
				backoff: {
					type: "exponential",
					delay: 1000,
				},
			},
		)
		logger.info({ to, subject }, "Enqueued email job successfully")
	} catch (error) {
		logger.error({ error }, "[Email Queue Error] Failed to enqueue email job")
	}
}
