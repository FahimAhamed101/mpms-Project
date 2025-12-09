import mongoose, { Schema, Document } from 'mongoose';
import { ISprint } from '../types';

export type ISprintDocument = ISprint & Document;

const SprintSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide sprint title'],
      trim: true,
    },
    sprintNumber: {
      type: Number,
      required: [true, 'Please provide sprint number'],
      min: 1,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    goal: {
      type: String,
      trim: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-increment sprint number per project
SprintSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  
  try {
    const Sprint = mongoose.model('Sprint');
    const lastSprint = await Sprint.findOne({ 
      project: this.project 
    }).sort({ sprintNumber: -1 });
    
    this.sprintNumber = lastSprint ? lastSprint.sprintNumber + 1 : 1;
    next();
  } catch (error: any) {
    next(error);
  }
});

export default mongoose.model<ISprintDocument>('Sprint', SprintSchema);