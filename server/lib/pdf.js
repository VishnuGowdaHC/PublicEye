// server/lib/pdf.js
const PDFDocument = require("pdfkit");

function createPdfBuffer({ title = "Summary", summaryText = "", tableData = [], meta = {} } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).fillColor("#111").text(title, { align: "center" });
      doc.moveDown(0.5);
      doc
        .fontSize(11)
        .fillColor("#666")
        .text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" });
      doc.moveDown();

      // Summary Section
      doc
        .fontSize(13)
        .fillColor("#000")
        .text("Executive Summary", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor("#222").text(summaryText, {
        align: "justify",
      });
      doc.moveDown(1.5);

      // Table Header
      if (tableData.length > 0) {
        doc
          .fontSize(13)
          .fillColor("#000")
          .text("Recent Reports Overview", { underline: true });
        doc.moveDown(0.7);

        // Table Columns
        const tableTop = doc.y;
        const colWidths = { id: 40, category: 150, status: 100, location: 230 };

        doc.fontSize(11).fillColor("#444").text("ID", 50, tableTop);
        doc.text("Category", 90, tableTop);
        doc.text("Status", 240, tableTop);
        doc.text("Location", 340, tableTop);
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke("#ccc");
        doc.moveDown(0.5);

        // Table Rows
        tableData.forEach((r) => {
        // Page overflow safety
        if (doc.y > 700) {
            doc.addPage();
            doc.moveDown(1);
            doc.fontSize(11).fillColor("#444");
            doc.text("ID", 50);
            doc.text("Category", 90);
            doc.text("Status", 240);
            doc.text("Location", 340);
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke("#ccc");
            doc.moveDown(0.5);
        }

        const y = doc.y;
        doc.fillColor("#000");
        doc.text(r.id.toString(), 50, y);
        doc.text(r.category, 90, y);
        doc.text(r.status, 240, y);
        doc.text(r.location, 340, y, { width: 200 });
        doc.moveDown(0.6);
        });
      }

      // Footer
      doc.moveDown(2);
      doc
        .fontSize(11)
        .fillColor("#555")
        .text(
          "For more detailed reports, check out the PublicEye app.",
          { align: "center" }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { createPdfBuffer };
