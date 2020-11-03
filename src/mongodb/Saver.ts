import mongoose from "mongoose";
import { getModelForClass } from "@typegoose/typegoose";

interface DataType {
  link: string;
}

interface GenericObject<T> {
  [key: string]: T;
}

// Accepts class, creates model, allows for saving data
// Data not passed upon initialization, pass into saveOrUpdate
export class Saver<T extends DataType> {
  constructor(public dataClass: any) {
    this.Model = getModelForClass(dataClass);
  }
  Model: any;
  async saveOrUpdate(data: T[]): Promise<void> {
    for (const datum of data) {
      const exists = await this.Model.exists({ link: datum.link });
      if (!exists) {
        const doc: mongoose.Document = new this.Model(datum);
        doc.save();
      } else {
        await this.Model.findOneAndUpdate({ link: datum.link }, datum, {
          passRawResult: true,
          useFindAndModify: false,
        });
      }
    }
  }

  async findOne(query: GenericObject<string>): Promise<boolean> {
    const doc = await this.Model.findOne(query);
    if (!doc) {
      return false;
    } else {
      return true;
    }
  }
}
