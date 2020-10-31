import mongoose from "mongoose";
import { getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";

interface DataType {
  link: string;
}
// Accepts data and class, allows for saving to database
export class Saver<T extends DataType> {
  model: ReturnModelType<AnyParamConstructor<any>, {}>;
  constructor(public data: T[], public dataClass: any) {
    const model = getModelForClass(dataClass);
    this.model = model;
  }
  async saveOrUpdate(): Promise<void> {
    console.log(`Saving documents for ${this.model.modelName}`);
    const savedDocuments = this.data.map((datum) => {
      return this.model.findOneAndUpdate({ link: datum.link }, datum, {
        new: true,
        upsert: true,
        rawResult: true, // Return the raw result from the MongoDB driver
        useFindAndModify: false,
      });
    });

    await Promise.all(savedDocuments);
  }
}
