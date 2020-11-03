//@ts-nocheck
import { HouseJobTypes } from "./jobs";
import { setupPuppeteer } from "../../puppeteer";
import { setInitialPage } from "./routines/common";
import { Saver } from "../../mongodb/Saver";
import { Committee, HouseCommittee } from "../../types";
import {
  puppeteerv1,
  puppeteerv2,
  puppeteerv3,
  puppeteerv4,
  puppeteerv5,
  puppeteerv6,
} from "./routines";

export const houseCommittees = async (data: HouseJobTypes): Promise<void> => {
  const browser = await setupPuppeteer();
  const page = await setInitialPage(browser);
  let res: Committee[] = [];
  try {
    switch (data.details.version) {
      case "puppeteerv1":
        res = await puppeteerv1(browser, page, data);
        break;
      case "puppeteerv2":
        res = await puppeteerv2(browser, page, data);
        break;
      case "puppeteerv3":
        res = await puppeteerv3(browser, page, data);
        break;
      case "puppeteerv4":
        res = await puppeteerv4(browser, page, data);
        break;
      case "puppeteerv5":
        res = await puppeteerv5(browser, page, data);
        break;
      case "puppeteerv6":
        res = await puppeteerv6(browser, page, data);
        break;
    }
    await browser.close();
    const saver = new Saver<Committee>(HouseCommittee);
    await saver.saveOrUpdate(res);
  } catch (err) {
    console.error(`Error running job ${data.name}`);
    await browser.close();
    throw new Error(err);
  }
};
