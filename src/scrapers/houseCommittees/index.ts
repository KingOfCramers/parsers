import { HouseJob } from "./jobs";

export const houseCommittees = async (data: HouseJob<{}>): Promise<void> => {
  console.log(`Checking ${data.link}`);
};
