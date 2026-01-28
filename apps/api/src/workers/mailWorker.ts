import { QueueEvents } from 'bullmq';
// import nodemailer from 'nodemailer';
// import { NODE_ENV, SMTP_HOST, SMTP_PORT } from '@/constants/env';
import { MAIL_QUEUE } from '@/constants/queue';
import { connection } from '@/lib/redis';
import { getLogger } from '@/middlewares/logger';

const logger = getLogger();
const queueEvents = new QueueEvents(MAIL_QUEUE, {
  connection,
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error(`${jobId} has failed with reason ${failedReason}`);
});

// type DataType = {
//   email: string;
//   firstName: string;
//   lastName: string;
//   mailType: 'magicLink';
//   token: string;
//   timeout: number;
// };

// let transporter: ReturnType<typeof nodemailer.createTransport>;

// if (NODE_ENV === 'production') {
//   transporter = nodemailer.createTransport({
//     host: SMTP_HOST,
//     port: SMTP_PORT,
//   });
// } else {
//   transporter = nodemailer.createTransport({
//     port: SMTP_PORT,
//     secure: false,
//   });
// }

// TODO: Move as a another package
// export const mailWorker = new Worker<DataType>(
//   MAIL_QUEUE,
//   async (job) => {
//     const controller = new AbortController();
//     const timer = setTimeout(() => controller.abort(), job.data.timeout);
//     const { mailType } = job.data;

//     if (mailType === 'magicLink') {
//       logger.info(`Sending email to: ${job.data.email}`);
//       try {
//         return await transporter.sendMail({
//           from: 'hello@hris.com',
//           to: job.data.email,
//           subject: 'Login to hris',
//           // TODO: UPdate URL
//           text: `Please click this link to login url: http://localhost:5173/magic-link?token=${job.data.token}`,
//         });
//       } catch (err) {
//         if (err instanceof Error && err.name === 'AbortError') {
//           throw new Error('Timeout');
//         } else {
//           throw err;
//         }
//       } finally {
//         clearTimeout(timer);
//       }
//     }

//     throw new Error('No matching mail type');
//   },
//   {
//     connection,
//   },
// );

// mailWorker.on('error', (error) => {
//   logger.error(error);
// });