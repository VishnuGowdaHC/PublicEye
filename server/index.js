require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { runSummaryJob } = require('./jobs/summery');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/trigger-summary', async (req, res) => {
  try {
    await runSummaryJob();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const cronSchedule = process.env.CRON_SCHEDULE;
if (cronSchedule) {
  console.log('Scheduling summary job at', cronSchedule);
  cron.schedule(cronSchedule, async () => {
    console.log('Cron trigger — running summary job');
    try {
      await runSummaryJob();
    } catch (err) {
      console.error('Cron job error', err);
    }
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on ${port}`));
