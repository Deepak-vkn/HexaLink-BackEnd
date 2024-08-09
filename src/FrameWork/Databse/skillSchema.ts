import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { Skill } from '../../Domain/skillType';

export interface SkillDocument extends Skill, Document {}



const SkillSchema: Schema = new Schema({
  Image: { type: String },
  Name: { type: String },
});

const Skill = mongoose.model<Skill>('Skill', SkillSchema);

export default Skill;

