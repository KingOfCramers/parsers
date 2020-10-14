import { InputType, Field } from "type-graphql";
import { getModelForClass, prop, post, pre } from "@typegoose/typegoose";
import mongoose from "mongoose";

interface PressRelease {
  link: string;
  title: string;
  date: Date;
  authorBureau: string;
  text: string;
  tags: string[];
}

// Used to query for committees
@InputType()
@post<PressRelease>("save", function (doc: mongoose.Document & any, next) {
  if (doc.wasNew) {
    console.log(`Document saved with id ${doc._id}`);
  }
})
@post<PressRelease>("save", function (
  err: mongoose.Error,
  doc: mongoose.Document,
  next: any
) {
  console.log("Document could not save: ", err.message);
  next();
})
export class StatePressRelease {
  @Field()
  @prop({ required: false, unique: true })
  link: string;

  @Field()
  @prop({ required: true })
  title: string;

  @Field()
  @prop({ required: true })
  date: Date;

  @Field()
  @prop({ required: true })
  authorBureau: string;

  @Field()
  @prop({ required: true })
  kind: string;

  @Field()
  @prop({ required: true })
  text: string;

  @Field((type) => [String])
  @prop({ type: String })
  tags: string[];
}

export const StatePressReleaseModel = getModelForClass(StatePressRelease);
