// server/lib/summarizer.js
require("dotenv").config();

async function summarizeReports(reports, periodDesc = "last 2 days") {
  if (!reports || reports.length === 0) {
    return {
      summary: `No reports found in the ${periodDesc}.`,
      tableData: [],
    };
  }

  // Build a trimmed input for the model
  const text = reports
    .map((r, i) => {
      const desc = (r.description || "").replace(/\n/g, " ");
      const category = r.category || "General Issue";
      const status = r.status || "Pending";
      const location = r.location?.address || "";
      return `${i + 1}. [${category}] ${desc} (${status}) ${location}`;
    })
    .join("\n")
    .slice(0, 10000);

  const hfModel = process.env.SUMMARY_MODEL || "facebook/bart-large-cnn";

  let summaryText = "Summary generation failed.";
  try {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${hfModel}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {
            max_length: 700,
            min_length: 150,
            do_sample: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("HuggingFace API error:", err);
    } else {
      const data = await response.json();
      summaryText =
        data?.[0]?.summary_text ||
        "Summary generation failed. Please try again later.";
    }
  } catch (error) {
    console.error("Summarizer error:", error);
  }

  // Prepare a table-friendly version of the reports
  const tableData = reports.slice(0, 10).map((r, i) => ({
    id: i + 1,
    category: r.category || "General Issue",
    status: r.status || "Pending",
    location: r.location?.address || "N/A",
  }));

  return { summary: summaryText.trim(), tableData };
}

module.exports = { summarizeReports };
