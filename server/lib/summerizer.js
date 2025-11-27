const Groq = require("groq-sdk");
const { postToTwitter } = require("../jobs/socialMedia");
require("dotenv").config();

async function summarizeReports(reports, periodDesc = "last 7 days") {
  if (!reports || reports.length === 0) {
    return {
      summary: `No reports found in the ${periodDesc}.`,
      tableData: [],
    };
  }

  const text = reports
    .sort((a, b) => (b.flags || 0) - (a.flags || 0))
    .map((r, i) => {
      const desc = (r.description || "").replace(/\n/g, " ");
      const category = r.category || "General Issue";
      const status = r.status || "Pending";
      const location = r.location?.address || "";
      const flags = r.flags || 0;
      return `${i + 1}. [${category}] ${desc} (${status}) ${location} (Flags: ${flags})`;
    })
    .join("\n")
    .slice(0, 4000); 

    const prompt = `
    Summarize the following civic issue reports into this EXACT format.

    1. Total Issues:
    2. Issues by Category:
    3. Top Flagged Issues:
    4. Resolved Issues:
    5. High Priority Areas:
    6. Short Summary:

    Rules:
    - Use - points.
    - Count accurately.
    - Do NOT invent anything.
    - Only use the data provided.
    - If something doesn’t exist, say "None".

    Reports:
    ${text}
    `;

    const groq = new Groq({
      apiKey: process.env.GROQ_API,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    const summaryText = completion.choices[0].message.content.trim();

    const tweetPrompt = `
    You are generating a public Twitter summary for civic issue reports.
      Follow this exact format and make sure everything is factual and under 240 characters.

      FORMAT:
      "We have collected X reports this week. The top issues were <issue1> and <issue2> .... <issueN>. <three-line closing statement>."

      Rules:
      - X = total number of reports
      - issue1 and issue2 must be the top 2-5 categories OR top 2-5 most-flagged issues (choose whichever is stronger)
      - Closing line must be 1-3 sentences, concise (e.g., "Authorities have been notified.", "High-priority areas will be reviewed.", etc.)
      - Do NOT add extra details.
      - Do NOT add bullet points.
      - Do NOT exceed 240 characters.

      Reports:
      ${text}

    `;

    const tweetResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: tweetPrompt }],
      temperature: 0.2,
    });

    let tweetText = tweetResponse.choices[0].message.content.trim();

    // Safety cutoff
    tweetText = tweetText.slice(0, 240);

    await postToTwitter({ summary: tweetText });
  
  const tableData = reports.slice(0, 10).map((r, i) => ({
    id: i + 1,
    category: r.category || "General Issue",
    status: r.status || "Pending",
    location: r.location?.address || "N/A",
  }));

  return { summary: summaryText.trim(), tableData };
}

module.exports = { summarizeReports };
