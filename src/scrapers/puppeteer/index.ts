import puppeteer from "puppeteer";

// This function only runs once and sets up our puppeteer browser.
export const setupPuppeteer = async (initVals: {
  kind: string | null;
}): Promise<puppeteer.Browser> => {
  const args = ["--no-sandbox", "--unlimited-storage"];

  const browser = await puppeteer.launch({
    headless:
      process.env.NODE_ENV === "production" || process.env.HEADLESS === "true",
    defaultViewport: null,
    devtools: process.env.NODE_ENV !== "production",
    args,
  });

  browser.on("disconnected", () => {
    console.log("Browser was disconnected.");
  });

  console.log("Configured puppeteer.");

  return browser;
};
