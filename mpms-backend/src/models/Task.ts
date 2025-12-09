import mongoose, { Schema, Document } from 'mongoose';
import { ITask, TaskStatus, TaskPriority } from '../types';


export type ITaskDocument = ITask & Document;
const SubtaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
});

const TaskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide task title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide task description'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    sprint: {
      type: Schema.Types.ObjectId,
      ref: 'Sprint',
      required: true,
    },
    assignees: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    estimatedHours: {
      type: Number,
      required: [true, 'Please provide estimated hours'],
      min: 0,
    },
    actualHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide due date'],
    },
    attachments: [{
      type: String,
    }],
    subtasks: [SubtaskSchema],
    tags: [{
      type: String,
      trim: true,
    }],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update project progress when task status changes
TaskSchema.post('save', async function () {
  const Project = mongoose.model('Project');
  await Project.findByIdAndUpdate(this.project, { $inc: { __v: 1 } });
});

export default mongoose.model<ITaskDocument>('Task', TaskSchema);