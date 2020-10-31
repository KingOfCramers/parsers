import { InputType, Field } from "type-graphql";
import { getModelForClass, prop, post, pre } from "@typegoose/typegoose";
import mongoose from "mongoose";

type StockDisclosure = {
  link: string;
  firstName: string;
  lastName: string;
  date: Date;
};

// Used to query for committees
@InputType()
@post<StockDisclosure>("save", function (doc: mongoose.Document & any, next) {
  if (doc.wasNew) {
    console.log(`Document saved with id ${doc._id}`);
  }
})
@post<StockDisclosure>("save", function (
  err: mongoose.Error,
  doc: mongoose.Document,
  next: any
) {
  console.log("Document could not save: ", err.message);
  next();
})
export class SenateStockDisclosure {
  @Field({ nullable: true })
  @prop({ required: false, unique: true })
  link: string;

  @Field()
  @prop({ required: true })
  firstName: string;

  @Field()
  @prop({ required: true })
  lastName: string;

  @Field()
  @prop({ required: true })
  date: Date;
}

export const SenateStockDisclosureModel = getModelForClass(
  SenateStockDisclosure
);
