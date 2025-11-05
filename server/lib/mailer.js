// server/lib/mailer.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function parseRecipients(envVar) {
  if (!envVar) return [];
  return envVar.split(',').map(s => s.trim()).filter(Boolean);
}

async function sendSummaryEmail({ subject, body, pdfBuffer, filename = 'summary.pdf' }) {
  const recipients = parseRecipients(process.env.SUMMARY_RECIPIENTS || '');
  if (!recipients.length) throw new Error('No recipients set');

  const msg = {
    to: recipients,
    from: process.env.SUMMARY_SENDER || 'no-reply@example.com',
    subject,
    text: body,
    attachments: pdfBuffer ? [
      {
        content: pdfBuffer.toString('base64'),
        filename,
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ] : []
  };

  await sgMail.send(msg);
  return true;
}

module.exports = { sendSummaryEmail };
