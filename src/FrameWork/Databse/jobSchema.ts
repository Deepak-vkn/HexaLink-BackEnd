import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { Job } from '../../Domain/jobTypes';


export interface JobDocument extends Job, Document {}

// Mongoose Schema
const JobsSchema: Schema = new Schema({
  package: { type: Number, required: true },
  expires: { type: Date, required: true },
  location: { type: String, required: true },
  opening: { type: String, required: true },
  status: { type: String, required: true },
  applications: { type: Number, default: 0 },
  skill: [{ type: String, required: true }],
  experience: { type: String, required: true },
  posted: { type: Date, default: Date.now },
  description: { type: String, required: true },
  level: { type: String, required: true },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }, 
  title: { type: String, required: true },
  applicants: [{ type: Schema.Types.ObjectId,  }],

});

const Jobs = mongoose.model<JobDocument>('Jobs', JobsSchema);

export default Jobs;
