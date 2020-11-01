import path from "path";
import moment from "moment";
import { resolve } from "path";
import dotenv from "dotenv";
import { connect } from "./mongodb/connect";
import { configureRedis } from "./redis";
import { setupPuppeteer } from "./puppeteer";
import {
  senateDisclosures,
  statePressReleases,
  getNewStatePressReleases,
  crsReports,
} from "./scrapers";
import { Report, CrsReport, StockDisclosure, PressRelease } from "./types";
import { QueueHandler } from "./queue";

const environment = process.env.NODE_ENV;
dotenv.config({ path: resolve(__dirname, `../.${environment}.env`) });

const runProgram = async () => {
  // Connect to our MongoDB database
  const db = await connect();

  // Configure Redis
  await configureRedis();

  // Types: Type of data needed for job, expected return value from one job. Arguments: Job name (string) and function to run
  const crsQueue = new QueueHandler<{}, Report>(
    "congressionalResearchReports",
    crsReports
  );

  const senateDisclosureQueue = new QueueHandler<{}, StockDisclosure>(
    "senateDisclosures",
    senateDisclosures
  );

  const statePressReleasesQueue = new QueueHandler<{}, PressRelease>(
    "statePressReleases",
    getNewStatePressReleases
  );

  // Create more jobs every half hour...
  setInterval(async () => {
    await senateDisclosureQueue.createJobs([{}], { retries: 1, timeout: 7500 });
    await statePressReleasesQueue.createJobs([{}], {
      retries: 1,
      timeout: 5000,
    });
    await crsQueue.createJobs([{}], { retries: 1, timeout: 5000 });
  }, 10000);

  crsQueue.process();
  statePressReleasesQueue.process();
  senateDisclosureQueue.process();
};

runProgram();
