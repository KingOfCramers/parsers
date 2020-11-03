import { Field, ObjectType } from "type-graphql";
import { prop, pre, post } from "@typegoose/typegoose";
import moment from "moment";
import mongoose from "mongoose";

export interface Base {}

const handleSetDate = (date: string): Date =>
  moment(date).isValid() ? moment(date).toDate() : new Date();

const handleSetTime = (date: string): Date =>
  moment(date).isValid() ? moment(date).toDate() : new Date();

@ObjectType({
  description:
    "The base class that sets the wasNew property for post-save logging",
})
@pre<Base>("save", function (next) {
  const document: mongoose.Document & any = this;
  document.wasNew = document.isNew; // Pass "newness" as new property for post-save
  next();
})
@post<Base>("save", function (
  err: mongoose.Error,
  doc: mongoose.Document,
  next: any
) {
  console.log("📄 Document could not save: ", err.message);
  next();
})
@post<Base>("save", function (doc: mongoose.Document & any, next) {
  if (doc.wasNew) {
    console.log(`📄 Document saved with id ${doc._id}`);
  }
})
@post<Base>("findOneAndUpdate", function (doc) {
  // This post-hook could be used to check whether a value has been updated.
  // To do this, we'd have to somehow compare the new values with the old values.
  // Currently, this is getting the old document back (by default).
  //const docOldValue = doc;
})
export class BaseType {
  @Field()
  @prop({ required: true, unique: true })
  link: string;

  @Field()
  @prop({
    required: true,
    get: (date) => date,
    set: (date: string) => handleSetDate(date),
  })
  date: Date;

  @Field()
  @prop({
    required: false,
    get: (time) => time,
    set: (time: string) => handleSetTime(time),
  })
  time?: Date;
}
