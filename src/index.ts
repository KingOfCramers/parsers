// Configure environment
import path, { resolve } from "path";
import dotenv from "dotenv";
const environment = process.env.NODE_ENV;
dotenv.config({ path: resolve(__dirname, `../.${environment}.env`) });

import moment from "moment";
import { connect } from "./mongodb/connect";
import { configureRedis } from "./redis";
import { setupPuppeteer } from "./puppeteer";
import { QueueHandler } from "./queue";

// Processes to run
import {
  senateDisclosures,
  getNewStatePressReleases,
  crsReports,
  houseCommittees,
} from "./scrapers";

// Types of return data
import {
  Report,
  CrsReport,
  StockDisclosure,
  PressRelease,
  Committee,
} from "./types";

// Jobs + Types
import { HouseJob, house } from "./scrapers/houseCommittees/jobs";

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

  const houseCommitteeQueue = new QueueHandler<HouseJob<{}>, Committee>(
    "houseCommittees",
    houseCommittees
  );

  // Create more jobs every half hour...
  setInterval(async () => {
    await senateDisclosureQueue.createJobs([{}], { retries: 1, timeout: 7500 });
    await statePressReleasesQueue.createJobs([{}], {
      retries: 1,
      timeout: 5000,
    });
    await crsQueue.createJobs([{}], { retries: 1, timeout: 5000 });
    await houseCommitteeQueue.createJobs([...house], {
      retries: 1,
      timeout: 10000,
    });
  }, 5000);

  crsQueue.process();
  statePressReleasesQueue.process();
  senateDisclosureQueue.process();
  houseCommitteeQueue.process();
};

runProgram();
