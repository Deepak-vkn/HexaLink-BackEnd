import { ObjectId } from "mongoose";

export interface Tokens{
    userId:ObjectId;
    token:string;
    expireAt:Date;
}