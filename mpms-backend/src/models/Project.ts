import mongoose, { Schema, Document } from 'mongoose';
import { IProject, ProjectStatus } from '../types';

type IProjectDocument = Omit<IProject, '_id'> & Document<any, any, any> & {
  _id: any; // Or a specific type like: _id: Types.ObjectId | string;
};

const ProjectSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide project title'],
      trim: true,
    },
    client: {
      type: String,
      required: [true, 'Please provide client name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide project description'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    budget: {
      type: Number,
      required: [true, 'Please provide budget'],
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.PLANNED,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    team: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
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

// Calculate progress based on tasks
ProjectSchema.methods.calculateProgress = async function (): Promise<void> {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  
  if (tasks.length === 0) {
    this.progress = 0;
    return;
  }
  
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  this.progress = Math.round((completedTasks / tasks.length) * 100);
};

export default mongoose.model<IProjectDocument>('Project', ProjectSchema);