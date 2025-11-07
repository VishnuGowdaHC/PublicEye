// server/jobs/summaryTwoDays.js
const { fetchReportsWithinDays, initFirebase } = require('../lib/firestore');
const { summarizeReports } = require('../lib/summerizer');
const { createPdfBuffer } = require('../lib/pdf');
const { sendSummaryEmail } = require('../lib/mailer');


async function runSummaryJob({ days = Number(process.env.SUMMARY_LOOKBACK_DAYS || 2), periodDesc = 'last 7 days' } = {}) {
  console.log(`[summaryJob] start: last ${days} days`);
  const admin = initFirebase();
  try {
    const reports = await fetchReportsWithinDays(days, 500);
    console.log(`[summaryJob] fetched ${reports.length} reports`);

    // Compose subject
    const subject = `Reports Summary — ${periodDesc} — ${reports.length} reports`;

    const { summary: summaryText, tableData } = await summarizeReports(reports, periodDesc);

    // Make PDF
    const pdfBuffer = await createPdfBuffer({
      title: `Reports Summary — ${periodDesc}`,
      body: summaryText,
      tableData
    });

    // Optionally upload PDF to storage (if configured)
    if (process.env.UPLOAD_PDF_TO_STORAGE === 'true') {
      const bucket = admin.storage().bucket();
      const path = process.env.PDF_STORAGE_PATH || `summaries/${Date.now()}.pdf`;
      const file = bucket.file(path);
      await file.save(pdfBuffer, { contentType: 'application/pdf' });
      console.log('[summaryJob] uploaded PDF to storage at', path);
    }

    // Send email with PDF attached
    await sendSummaryEmail({ subject, body: summaryText, pdfBuffer, filename: `summary-${Date.now()}.pdf` });
    console.log('[summaryJob] email sent');
    return { ok: true };
  } catch (err) {
    console.error('[summaryJob] error', err);
    throw err;
  }
}

module.exports = { runSummaryJob };
