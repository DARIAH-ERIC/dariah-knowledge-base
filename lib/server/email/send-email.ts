import { createTransport, type SendMailOptions } from "nodemailer";

import { env } from "@/config/env.config";

interface SendEmailParams
	extends Pick<SendMailOptions, "attachments" | "from" | "html" | "subject" | "text" | "to"> {}

export function sendEmail(params: SendEmailParams) {
	const { attachments, from, html, subject, text, to } = params;

	const transporter = createTransport({
		host: env.EMAIL_SMTP_SERVER,
		port: env.EMAIL_SMTP_PORT,
		secure: false,
		auth:
			env.EMAIL_SMTP_USERNAME && env.EMAIL_SMTP_PASSWORD
				? {
						user: env.EMAIL_SMTP_USERNAME,
						pass: env.EMAIL_SMTP_PASSWORD,
					}
				: undefined,
	});

	return transporter.sendMail({
		from,
		to,
		subject,
		text,
		html,
		attachments,
	});
}
