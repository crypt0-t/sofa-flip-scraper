const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sofa Scraper is live!");
});

app.post("/scrape", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    await page.waitForTimeout(5000);

    const data = await page.evaluate(() => {
      const titleEl = document.querySelector("h1");
      const priceEl = document.querySelector("span[dir='auto']");
      const descEl = document.querySelector("div[style*='white-space']");
      const imgEl = document.querySelector("img[src*='scontent']");

      return {
        title: titleEl?.innerText || "",
        price: priceEl?.innerText || "",
        description: descEl?.innerText || "",
        image: imgEl?.src || "",
      };
    });

    res.json(data);
  } catch (error) {
    console.error("Scrape error:", error);
    res.status(500).json({ error: "Failed to scrape" });
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
