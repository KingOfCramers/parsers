import path from "path";
import { execShellCommand, chunk } from "../../util";
import moment from "moment";

interface Data {
  title: string;
  link: string;
  updatedAt: Date;
  id: string;
}
// This function only runs once and sets up our puppeteer browser.
export const crsReports = async () => {
  await execShellCommand("python3", path.resolve(__dirname, "parser.py"))
    .then((res) => {
      let rows: string[][] = chunk(4, res.split("\n"));
      let data: Data[] = rows
        .filter((x) => x.length === 4)
        .map((item) => {
          return {
            title: item[0],
            link: item[1],
            updatedAt: moment(item[2]).toDate(),
            id: item[3],
          };
        });
      console.log(data);
    })
    .catch((err) => console.error(err));
};
