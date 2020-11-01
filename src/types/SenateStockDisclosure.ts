import { InputType, Field } from "type-graphql";
import { getModelForClass, prop, post, pre } from "@typegoose/typegoose";
import { BaseType } from "./BaseType";
import mongoose from "mongoose";

export interface StockDisclosure extends BaseType {
  firstName: string;
  lastName: string;
}

@InputType()
export class SenateStockDisclosure extends BaseType implements StockDisclosure {
  @Field()
  @prop({ required: true })
  firstName: string;

  @Field()
  @prop({ required: true })
  lastName: string;
}
