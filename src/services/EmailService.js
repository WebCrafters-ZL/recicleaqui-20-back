import nodemailer from 'nodemailer';
import logger from '../utils/Logger.js';
import ConfigUtils from '../utils/ConfigUtils.js';

/**
 * EmailService - responsável por enviar emails (ex: recuperação de senha)
 */
export default class EmailService {
  constructor() {
    // Armazena uma promessa para o transporter (permite uso de createTestAccount)
    this.transporterPromise = this.createTransport();
    this.usingEthereal = false;
  }

  async createTransport() {
    const useEthereal = ConfigUtils.USE_ETHEREAL;
    const host = ConfigUtils.SMTP_HOST;
    const port = ConfigUtils.SMTP_PORT;
    const user = ConfigUtils.SMTP_USER;
    const pass = ConfigUtils.SMTP_PASS;

    if (useEthereal || !host || !user || !pass) {
      // Fallback para conta Ethereal automática
      const testAccount = await nodemailer.createTestAccount();
      this.usingEthereal = true;
      logger.info('Usando conta Ethereal para envio de emails de teste.');
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  async getTransporter() {
    if (!this.transporter) {
      this.transporter = await this.transporterPromise;
    }
    return this.transporter;
  }

  async sendPasswordResetEmail(to, code) {
    const transporter = await this.getTransporter();
    const from = ConfigUtils.EMAIL_FROM;
    const subject = 'Recuperação de senha';
    const html = `
      <p>Você solicitou a redefinição de senha.</p>
      <p>Use o código abaixo para redefinir sua senha (válido por 1 hora):</p>
      <p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 8px; color: #333; padding: 20px; background-color: #f5f5f5; border-radius: 8px;">${code}</p>
      <p>Se você não solicitou, ignore este email.</p>
    `;

    const mailOptions = { from, to, subject, html };

    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Email de recuperação enviado: MessageID=${info.messageId}`);
      if (this.usingEthereal) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info(`Preview Ethereal: ${previewUrl}`);
        }
      }
    } catch (err) {
      logger.error('Erro ao enviar email de recuperação: ' + err.message);
      throw err;
    }
  }
}
