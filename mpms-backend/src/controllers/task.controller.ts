import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Task from '../models/Task';
import Project from '../models/Project';
import Sprint from '../models/Sprint';
import Comment from '../models/Comment';
import { TaskStatus, TaskPriority } from '../types';

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const {
      title,
      description,
      project,
      sprint,
      assignees,
      estimatedHours,
      priority,
      dueDate,
      tags,
    } = req.body;


    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }


    if (sprint) {
      const sprintDoc = await Sprint.findById(sprint);
      if (!sprintDoc) {
        res.status(404).json({ success: false, message: 'Sprint not found' });
        return;
      }
    }

    const task = await Task.create({
      title,
      description,
      project,
      sprint,
      assignees: assignees || [],
      estimatedHours,
      priority: priority || TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate,
      tags: tags || [],
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title client')
      .populate('sprint', 'title sprintNumber')
      .populate('assignees', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      project,
      sprint,
      assignee,
      status,
      priority,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const userId = req.user?._id;
    const userRole = req.user?.role;

    let query: any = {};


    if (project) query.project = project;
    if (sprint) query.sprint = sprint;
    if (assignee) query.assignees = assignee;
    if (status) query.status = status;
    if (priority) query.priority = priority;

  
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

  
    if (userRole === 'member') {
      query.assignees = userId;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const tasks = await Task.find(query)
      .populate('project', 'title client status')
      .populate('sprint', 'title sprintNumber')
      .populate('assignees', 'name email avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total,
      pages: Math.ceil(total / limitNum),
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title client status manager')
      .populate('sprint', 'title sprintNumber startDate endDate')
      .populate('assignees', 'name email avatar role department skills');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const userId = req.user?._id;
    const userRole = req.user?.role;
    const isAssigned = task.assignees.some(
      (assignee: any) => assignee._id.toString() === userId?.toString()
    );

    if (userRole === 'member' && !isAssigned) {
      res.status(403).json({ success: false, message: 'Not authorized to access this task' });
      return;
    }


    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name email avatar')
      .populate('parentComment')
      .sort('createdAt');

    
    const activityLog = [
      {
        user: req.user?.name,
        action: 'viewed',
        timestamp: new Date(),
      },
    ];

    res.status(200).json({
      success: true,
      data: {
        task,
        comments,
        activityLog,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check authorization
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const isAssigned = task.assignees.some(
      (assignee: any) => assignee.toString() === userId?.toString()
    );

    // Members can only update status, actualHours, and add comments
    if (userRole === 'member' && !isAssigned) {
      res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      return;
    }

    // If member, only allow certain fields
    if (userRole === 'member') {
      const allowedFields = ['status', 'actualHours', 'subtasks', 'attachments'];
      const updateFields = Object.keys(req.body);
      const invalidFields = updateFields.filter(field => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        res.status(403).json({
          success: false,
          message: `Members can only update: ${allowedFields.join(', ')}`,
        });
        return;
      }

      // If status is being changed to Review, notify manager
      if (req.body.status === TaskStatus.REVIEW) {
        req.body.completedAt = new Date();
      }
    }

    // Check if trying to mark as DONE
    if (req.body.status === TaskStatus.DONE) {
      // Only managers or admins can mark as DONE
      if (userRole !== 'manager' && userRole !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Only managers or admins can mark tasks as Done',
        });
        return;
      }
      
      // Also set completedAt when marking as DONE
      req.body.completedAt = new Date();
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'title client')
      .populate('sprint', 'title sprintNumber')
      .populate('assignees', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Only admin or project manager can delete
    const userRole = req.user?.role;
    if (userRole !== 'admin' && userRole !== 'manager') {
      res.status(403).json({ success: false, message: 'Not authorized to delete tasks' });
      return;
    }

    await task.deleteOne();
    
    // Delete associated comments
    await Comment.deleteMany({ task: task._id });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { content, parentComment, attachments } = req.body;
    const taskId = req.params.id;
    const userId = req.user?._id;

    // Verify task exists and user has access
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const comment = await Comment.create({
      task: taskId,
      user: userId,
      content,
      parentComment,
      attachments: attachments || [],
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email avatar')
      .populate('parentComment');

    res.status(201).json({
      success: true,
      data: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check if user is assigned to the task
    const userId = req.user?._id;
    const isAssigned = task.assignees.some(
      (assignee: any) => assignee.toString() === userId?.toString()
    );

    if (!isAssigned && req.user?.role === 'member') {
      res.status(403).json({ success: false, message: 'Not authorized to update this task' });
      return;
    }

    // Check if status transition is valid
    const validTransitions = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.TODO],
      [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
      [TaskStatus.DONE]: [TaskStatus.REVIEW],
    };

    if (!validTransitions[task.status as keyof typeof validTransitions]?.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status transition from ${task.status} to ${status}`,
      });
      return;
    }

    // If marking as Done, check if user is manager
    if (status === TaskStatus.DONE && req.user?.role === 'member') {
      res.status(403).json({
        success: false,
        message: 'Only managers can mark tasks as Done',
      });
      return;
    }

    // Update task status
    task.status = status;
    if (status === TaskStatus.DONE) {
      task.completedAt = new Date();
    }
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate('project', 'title client')
      .populate('sprint', 'title sprintNumber')
      .populate('assignees', 'name email avatar');

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const logTime = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { hours } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Check if user is assigned to the task
    const userId = req.user?._id;
    const isAssigned = task.assignees.some(
      (assignee: any) => assignee.toString() === userId?.toString()
    );

    if (!isAssigned && req.user?.role === 'member') {
      res.status(403).json({ success: false, message: 'Not authorized to log time for this task' });
      return;
    }

    // Update actual hours
    task.actualHours = (task.actualHours || 0) + parseFloat(hours);
    await task.save();

    res.status(200).json({
      success: true,
      data: {
        taskId: task._id,
        actualHours: task.actualHours,
        estimatedHours: task.estimatedHours,
      },
    });
  } catch (error) {
    next(error);
  }
};