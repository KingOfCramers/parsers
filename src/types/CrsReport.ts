import { InputType, Field } from "type-graphql";
import { getModelForClass, prop, post, pre } from "@typegoose/typegoose";
import mongoose from "mongoose";

export type Report = {
  title: string;
  link: string;
  date: Date;
  id: string;
};

// Used to query for committees
@InputType()
@post<Report>("save", function (doc: mongoose.Document & any, next) {
  if (doc.wasNew) {
    console.log(`Document saved with id ${doc._id}`);
  }
})
@post<Report>("save", function (
  err: mongoose.Error,
  doc: mongoose.Document,
  next: any
) {
  console.log("Document could not save: ", err.message);
  next();
})
export class CrsReport {
  @Field()
  @prop({ required: true, unique: true })
  link: string;

  @Field()
  @prop({ required: true })
  title: string;

  @Field()
  @prop({ required: true })
  id: string;

  @Field()
  @prop({ required: true })
  date: Date;
}
