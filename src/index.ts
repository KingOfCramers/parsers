import path from "path";
import moment from "moment";
import { chunk } from "./util";
import { resolve } from "path";
import dotenv from "dotenv";
import { connect } from "./mongodb/connect";
import { senateDisclosures } from "./scrapers/senateDisclosures";
import { setupPuppeteer } from "./scrapers/puppeteer";
import { crsReports } from "./rss/crsReports";
const envi = process.env.NODE_ENV;
dotenv.config({ path: resolve(__dirname, `../.${envi}.env`) });

const runProgram = async () => {
  const browser = await setupPuppeteer({ kind: null });
  const db = await connect();
  //await crsReports();
  await senateDisclosures(browser);
  await db.close();
};

runProgram();
