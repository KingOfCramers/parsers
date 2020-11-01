import path from "path";
import moment from "moment";
import { resolve } from "path";
import dotenv from "dotenv";
import { connect } from "./mongodb/connect";
import { setupPuppeteer } from "./puppeteer";
import {
  senateDisclosures,
  statePressReleases,
  getNewStatePressReleases,
  crsReports,
} from "./scrapers";

const environment = process.env.NODE_ENV;
dotenv.config({ path: resolve(__dirname, `../.${environment}.env`) });

const runProgram = async () => {
  const browser = await setupPuppeteer({ kind: null });
  const db = await connect();
  await crsReports();
  await senateDisclosures(browser);
  await getNewStatePressReleases();
  await db.close();
};

runProgram();
