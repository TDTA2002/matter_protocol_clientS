import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface MailOption {
    to: string, // Người nhận
    subject: string, // Chủ Đề
    html?: string, // Template HTML
    text?: string // Văn Bản
}

import emailConfirm from './template/emailConfirm'
import emailLogin from './template/emailLogin'
import emailResetPassword from './template/emailResetPassword'

export const templates = {
    emailConfirm,
    emailLogin,
    emailResetPassword
}

@Injectable()
export class MailService {
    async sendMail(mailOption: MailOption) {
        try {

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.MS_USER,
                    pass: process.env.MS_PW
                }
            });

            await transporter.sendMail({
                from: process.env.MS_USER,
                ...mailOption
            });

            return true
        } catch (err) {
            return false
        }
    }
}
