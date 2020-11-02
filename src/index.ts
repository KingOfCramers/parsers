// Configure environment
import { resolve } from "path";
import dotenv from "dotenv";
const environment = process.env.NODE_ENV;
dotenv.config({ path: resolve(__dirname, `../.${environment}.env`) });

import { connect } from "./mongodb/connect";
import { configureRedis } from "./redis";
import { QueueHandler } from "./queue";

// Processes to run
import {
  senateDisclosures,
  getNewStatePressReleases,
  crsReports,
  houseCommittees,
} from "./scrapers";

// Types of return data
import { Report, StockDisclosure, PressRelease, Committee } from "./types";

// Jobs + Types
import { HouseJobTypes, house } from "./scrapers/houseCommittees/jobs";

const runProgram = async () => {
  // Connect to our MongoDB database
  await connect();

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

  const houseCommitteeQueue = new QueueHandler<HouseJobTypes, Committee>(
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
      timeout: 15000,
    });
  }, 5000);

  //crsQueue.process();
  //statePressReleasesQueue.process();
  //senateDisclosureQueue.process();
  houseCommitteeQueue.process();
};

runProgram();
