'use server'
import nodemailer from 'nodemailer';

interface EmailPayload {
  to: string;
  subject: string;
  ticketData: {
    titulo: string;
    descripcion: string;
    prioridad: string;
    creadoPor: string;
    link: string;
  };
}

export async function sendEmailAction(payload: EmailPayload) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="background-color: #dc2626; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🚨 ALERTA CRÍTICA</h1>
          </div>
          <div style="padding: 30px;">
              <p style="font-size: 16px; color: #374151;">Se requiere atención inmediata en un nuevo ticket.</p>
              <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                  <p><strong>👤 Creado por:</strong> ${payload.ticketData.creadoPor}</p>
                  <p><strong>🏷️ Título:</strong> ${payload.ticketData.titulo}</p>
                  <p><strong>📝 Descripción:</strong> ${payload.ticketData.descripcion}</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${payload.ticketData.link}" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                      VER TICKET EN LA WEB
                  </a>
              </div>
          </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Sistema de Tickets" <${process.env.SMTP_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("Error SMTP:", error);
    return { success: false, error };
  }
}