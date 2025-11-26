import nodemailer from 'nodemailer';
import logger from '../utils/Logger.js';

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
    const useEthereal = process.env.USE_ETHEREAL === 'true';
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

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

  async sendPasswordResetEmail(to, links) {
    const transporter = await this.getTransporter();
    const from = process.env.EMAIL_FROM || 'no-reply@example.com';
    const subject = 'Recuperação de senha';
    const { webLink, deepLink } = typeof links === 'string' ? { webLink: links, deepLink: null } : links;
    const deepSection = deepLink
      ? `<p>Se estiver no aplicativo móvel e o link acima não abrir: <br/><code>${deepLink}</code></p>`
      : '';
    const html = `
      <p>Você solicitou a redefinição de senha.</p>
      <p>Clique no link abaixo (válido por 1 hora):</p>
      <p><a href="${webLink}">${webLink}</a></p>
      ${deepSection}
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
