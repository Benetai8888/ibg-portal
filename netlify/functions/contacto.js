const nodemailer = require('nodemailer');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch(e) {
    const params = new URLSearchParams(event.body);
    body = Object.fromEntries(params);
  }

  const { nombre, empresa, email, phone, area, mensaje } = body;

  if (!nombre || !email || !mensaje) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: 'Campos requeridos faltantes' })
    };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
      user: 'info@ibg.legal',
      pass: 'ibgLegal888$'
    }
  });

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;">
      <h2 style="color:#1a1a1a;border-bottom:2px solid #c9a84c;padding-bottom:10px;">Nueva consulta — IBG Legal</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;font-weight:bold;color:#555;width:35%;">Nombre:</td><td style="padding:8px;">${nombre}</td></tr>
        ${empresa ? `<tr><td style="padding:8px;font-weight:bold;color:#555;">Empresa:</td><td style="padding:8px;">${empresa}</td></tr>` : ''}
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Email:</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:8px;font-weight:bold;color:#555;">Teléfono:</td><td style="padding:8px;">${phone}</td></tr>` : ''}
        ${area ? `<tr><td style="padding:8px;font-weight:bold;color:#555;">Área:</td><td style="padding:8px;">${area}</td></tr>` : ''}
        <tr><td style="padding:8px;font-weight:bold;color:#555;vertical-align:top;">Consulta:</td><td style="padding:8px;">${mensaje.replace(/\n/g,'<br>')}</td></tr>
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"IBG Legal Sitio Web" <info@ibg.legal>',
      to: 'info@ibg.legal',
      replyTo: email,
      subject: `Nueva consulta: ${nombre}${area ? ' — ' + area : ''}`,
      html
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
