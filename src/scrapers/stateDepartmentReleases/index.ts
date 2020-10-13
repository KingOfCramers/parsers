import cheerio from "cheerio";
import moment from "moment";
import typegoose from "@typegoose/typegoose";
import axios, { AxiosResponse } from "axios";
import util from "util";
import { capitalize, clean } from "../../util";
import { StatePressReleaseModel, StatePressRelease } from "../../types";

const parseData = (link: string, $: cheerio.Root): StatePressRelease => {
  const title = $(".featured-content__headline")
    .text()
    .trim()
    .replace(/\s\s+/g, " ");
  const authorBureau = $(".article-meta__author-bureau")
    .text()
    .replace(/\s\s+/g, " ");
  const dateString = $(".article-meta__publish-date")
    .text()
    .replace(/\s\s+/g, " ");
  const date = moment(dateString, "MMM dd, YYYY").toDate();
  const text = $("div.entry-content").text().replace(/\s\s+/g, " ");
  const tags = $("div.related-tags__pills a")
    .toArray()
    .map((x, i) => $(x).text().replace(/\s\s+/g, " "));

  return { title, authorBureau, date, text, tags, link };
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

const saveData = async (
  datum: StatePressRelease
): Promise<typegoose.DocumentType<StatePressRelease>> => {
  const doc = await StatePressReleaseModel.findOne({ link: datum.link });
  if (!doc) {
    console.log(`Saving new doc ${datum.link}`);
    const newDoc = new StatePressReleaseModel(datum);
    return newDoc.save();
  } else {
    doc.set({ ...datum });
    let saving = doc.save();
    return saving;
  }
};

const pageNumbers = Array.from({ length: 693 }, (x, i) => i);

export const statePressReleases = async () => {
  for (const pageNumber of pageNumbers) {
    const link = `https://www.state.gov/press-releases/page/${pageNumber}/`;
    try {
      // Get all sub-links that contain actual releases
      //console.log(`Fetching links from ${link}`);
      const response = await axios.get(link);
      const $ = cheerio.load(response.data);
      const links = parseReleaseStrings($);
      for (const sublink of links) {
        //Get data from every sub-link
        //console.log(`Fetching data from ${sublink}`);
        try {
          const response = await axios.get(sublink);
          const $ = cheerio.load(response.data);
          const data = parseData(sublink, $);

          await saveData(data);
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
};
