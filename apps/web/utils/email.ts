import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";


export const sendEmail = async (
    body: string
): Promise<void> => {

    if (!process.env.MAILSENDER_API_KEY || !process.env.MAILSENDER_FROM_EMAIL || !process.env.MAILSENDER_TO_EMAIL) {
        throw new Error("MailerSend configuration is incomplete. Please check your environment variables.");
    };

    const mailerSend = new MailerSend({
        apiKey: process.env.MAILSENDER_API_KEY,
    });

    const sentFrom = new Sender(process.env.MAILSENDER_FROM_EMAIL, "Feedback Admin");

    const recipients = [
        new Recipient(process.env.MAILSENDER_TO_EMAIL, "Feedback Recipient"),
    ];

    const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject("New Feedback Received")
        .setHtml(`<strong>${body}</strong>`);

    await mailerSend.email.send(emailParams);
}
