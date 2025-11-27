const fs = require('fs');
const puppeteer = require('puppeteer');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function postToTwitter({ summary }) {
    const tweetText = summary.slice(0, 250)
  try {
    const cookies = JSON.parse(fs.readFileSync(__dirname + "/cookies.json", "utf8"));

    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setCookie(...cookies);

    // Go to home
    await page.goto("https://x.com/home", { waitUntil: "networkidle2" });

    // The real Draft.js editable div
    const editorSelector = 'div.public-DraftEditor-content[data-testid="tweetTextarea_0"]';

    // Wait for composer to appear
    await page.waitForSelector(editorSelector, { visible: true });

    const editor = await page.$(editorSelector);
    await editor.focus();

    // Type the summary into the Draft.js tweet box
    await page.keyboard.type(tweetText, { delay: 10 });

    // Click the Post button
    await page.waitForSelector('[data-testid="tweetButtonInline"]', { visible: true });
    await page.click('[data-testid="tweetButtonInline"]');

    console.log("Tweet posted successfully!");
    await delay(1500);

    await browser.close();
  } catch (error) {
    console.error("Error posting to Twitter:", error);
  }
}

module.exports = { postToTwitter };
