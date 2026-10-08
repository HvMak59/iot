import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { winstonServerLogger } from 'src/app_config/serverWinston.config';

// export interface EmailOptions {
//     to: string;
//     subject: string;
//     html: string;
//     text?: string;
//     attachments?: {
//         filename: string;
//         path: string;
//     }[];
// }

// export interface EmailOptions {
//     to: string;
//     subject: string;
//     html: string;
//     text?: string;

//     bcc?: string[];

//     attachments?: {
//         filename: string;
//         path: string;
//     }[];
// }

export interface EmailOptions {
    to: string | string[];
    subject: string;
    // html: string;
    text?: string;

    attachments?: {
        filename: string;
        path: string;
    }[];
}


@Injectable()
export class EmailService {
    private readonly logger = winstonServerLogger(EmailService.name);
    private transporter: Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
            port: this.configService.get('SMTP_PORT'),
            secure: this.configService.get('SMTP_SECURE'),
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }

    async sendEmail(options: EmailOptions) {
        // async sendEmail(to: string) {
        // 
        console.log('in email');
        try {
            const mailOptions = {
                from: this.configService.get('SMTP_FROM', 'noreply@hermes.com'),
                to: options.to,
                subject: options.subject,
                // html: options.html,
                text: options.text,
                attachments: options.attachments
            };

            // const mailOptions = {
            //     from: this.configService.get('SMTP_FROM', 'noreply@hermes.com'),
            //     to: to,
            //     subject: 'alert',
            //     html: '',
            //     text: 'alert created',
            // };s

            // console.log(mailOptions);

            await this.transporter.sendMail(mailOptions);
            this.logger.debug(`Email sent successfully to ${options.to}`);
            return true;
        } catch (error) {
            this.logger.error(`Failed to send email to ${options.to}:`, error);
            return false;
        }
    }
}
