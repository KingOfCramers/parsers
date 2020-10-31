import cheerio from "cheerio";
import moment from "moment";
import typegoose from "@typegoose/typegoose";
import axios, { AxiosResponse } from "axios";
import util from "util";
import { capitalize, clean, wait } from "../../util";
import { StatePressReleaseModel, StatePressRelease } from "../../types";

const parseData = (link: string, $: cheerio.Root): StatePressRelease => {
  const title = $(".featured-content__headline")
    .text()
    .trim()
    .replace(/\s\s+/g, " ");
  const kind = $(".doctype-meta").text();
  const authorBureau = $(".article-meta__author-bureau")
    .text()
    .replace(/\s\s+/g, " ");
  const dateString = $(".article-meta__publish-date")
    .text()
    .replace(/\s\s+/g, " ");
  const date = moment(dateString).toDate();
  const text = $("div.entry-content").text().replace(/\s\s+/g, " ");
  const tags = $("div.related-tags__pills a")
    .toArray()
    .map((x, i) => $(x).text().replace(/\s\s+/g, " "));

  return { title, kind, authorBureau, date, text, tags, link };
};

const parseReleaseStrings = ($: cheerio.Root): string[] => {
  const links = $("div.collection-list li a")
    .toArray()
    .reduce((agg, element, i) => {
      const link = $(element).attr("href");
      if (link) {
        agg.push(link);
      }
      return agg;
    }, [] as string[]);

  return links;
};

// 693 pages.
//const pageNumbers = Array.from({ length: 243 }, (x, i) => i + 450);
const pageNumbers = Array.from({ length: 693 }, (x, i) => i);

export const statePressReleases = async () => {
  for (const pageNumber of pageNumbers) {
    const link = `https://www.state.gov/press-releases/page/${pageNumber}/`;
    try {
      // Get all sub-links that contain actual releases
      const response = await axios.get(link);
      const $ = cheerio.load(response.data);
      const links = parseReleaseStrings($);
      for (const sublink of links) {
        await wait(500);
        //Get data from every sub-link
        try {
          const response = await axios.get(sublink);
          const $ = cheerio.load(response.data);
          const data = parseData(sublink, $);
          // Save or update data
          let doc = await StatePressReleaseModel.findOneAndUpdate(
            { link: data.link },
            { ...data },
            { new: true, upsert: true }
          );
          console.log(`Saved or updated ${data.link}`);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const getNewStatePressReleases = async () => {
  const link = `https://www.state.gov/press-releases/page/0`;
  // Get all sub-links that contain actual releases
  const response = await axios.get(link);
  const $ = cheerio.load(response.data);
  const links = parseReleaseStrings($);
  for (const sublink of links) {
    // Check if the sublink is already stored.
    const exists = StatePressReleaseModel.findOne({ link: sublink });
    if (!exists) {
      try {
        const response = await axios.get(sublink);
        const $ = cheerio.load(response.data);
        const data = parseData(sublink, $);
        // Save or update data
        let doc = await StatePressReleaseModel.findOneAndUpdate(
          { link: data.link },
          { ...data },
          { new: true, upsert: true }
        );
        console.log(`Saved new file: ${data.link}`);
      } catch (err) {
        console.error(err);
      }
    }
  }
};
