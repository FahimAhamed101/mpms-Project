import mongoose, { Schema, Document } from 'mongoose';
import { IComment } from '../types';


export type ICommentDocument  = IComment & Document;
const CommentSchema: Schema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide comment content'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    attachments: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICommentDocument>('Comment', CommentSchema);