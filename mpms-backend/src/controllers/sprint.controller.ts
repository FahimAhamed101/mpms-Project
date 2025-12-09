import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Sprint from '../models/Sprint';
import Task from '../models/Task';
import Project from '../models/Project';

export const createSprint = async (
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

    const { title, project, startDate, endDate, goal } = req.body;


    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const userId = req.user?._id;
    const isTeamMember = projectDoc.team.some(
      (member: any) => member.toString() === userId?.toString()
    );

    if (req.user?.role !== 'admin' && !isTeamMember) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const sprint = await Sprint.create({
      title,
      project,
      startDate,
      endDate,
      goal,
    });

    res.status(201).json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

export const getSprints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.query;

    let query: any = {};
    if (projectId) {
      query.project = projectId;
    }

    const sprints = await Sprint.find(query)
      .populate('project', 'title client status')
      .sort('sprintNumber');

  
    const sprintsWithStats = await Promise.all(
      sprints.map(async (sprint) => {
        const tasks = await Task.find({ sprint: sprint._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.status === 'Done').length;

        return {
          ...sprint.toObject(),
          stats: {
            totalTasks,
            completedTasks,
            progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: sprintsWithStats.length,
      data: sprintsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getSprintById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('project', 'title client status manager');

    if (!sprint) {
      res.status(404).json({ success: false, message: 'Sprint not found' });
      return;
    }


    const tasks = await Task.find({ sprint: sprint._id })
      .populate('assignees', 'name email avatar')
      .sort('-createdAt');


    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'Done').length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


    if (sprint.progress !== progress) {
      sprint.progress = progress;
      await sprint.save();
    }

    const sprintWithDetails = {
      ...sprint.toObject(),
      tasks,
      stats: {
        totalTasks,
        completedTasks,
        progress,
      },
    };

    res.status(200).json({
      success: true,
      data: sprintWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSprint = async (
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

    let sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      res.status(404).json({ success: false, message: 'Sprint not found' });
      return;
    }

    sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('project', 'title client');

    res.status(200).json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSprint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      res.status(404).json({ success: false, message: 'Sprint not found' });
      return;
    }


    await Task.updateMany(
      { sprint: sprint._id },
      { $unset: { sprint: 1 } }
    );

    await sprint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sprint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};