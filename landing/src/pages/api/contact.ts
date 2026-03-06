import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const requiredEnv = [
  'SMTP_HOST',
  'STARTLS_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM',
  'CONTACT_TO_EMAIL',
] as const;

const getMissingEnv = () => requiredEnv.filter((key) => !import.meta.env[key]);

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const missing = getMissingEnv();
    if (missing.length > 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: `Faltan variables de entorno: ${missing.join(', ')}`,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Formato inválido. Debe ser JSON.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const body = (await request.json()) as {
      nombre?: string;
      email?: string;
      telefono?: string;
      mensaje?: string;
    };

    const nombre = (body.nombre ?? '').trim();
    const email = (body.email ?? '').trim();
    const telefono = (body.telefono ?? '').trim();
    const mensaje = (body.mensaje ?? '').trim();

    if (!nombre || !email || !mensaje) {
      return new Response(
        JSON.stringify({ ok: false, message: 'Nombre, email y mensaje son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.STARTLS_PORT),
      secure: false,
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASSWORD,
      },
      requireTLS: true,
    });

    await transporter.sendMail({
      from: import.meta.env.SMTP_FROM,
      to: import.meta.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `Nuevo contacto landing - ${nombre}`,
      text: [
        'Nuevo mensaje desde la landing de Tribal Trend',
        '',
        `Nombre: ${nombre}`,
        `Email: ${email}`,
        `Telefono: ${telefono || 'No informado'}`,
        '',
        'Mensaje:',
        mensaje,
      ].join('\n'),
      html: `
        <h2>Nuevo mensaje desde la landing de Tribal Trend</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefono:</strong> ${telefono || 'No informado'}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje.replace(/\n/g, '<br>')}</p>
      `,
    });

    return new Response(
      JSON.stringify({ ok: true, message: 'Mensaje enviado correctamente.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, message: 'No se pudo enviar el mensaje.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
