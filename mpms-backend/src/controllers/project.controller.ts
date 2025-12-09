import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Project from '../models/Project';
import Task from '../models/Task';
import { UserRole } from '../types';

export const createProject = async (
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
      client,
      description,
      startDate,
      endDate,
      budget,
      status,
      thumbnail,
    } = req.body;

  
    const manager = req.body.manager || req.user?._id;

    const project = await Project.create({
      title,
      client,
      description,
      startDate,
      endDate,
      budget,
      status,
      thumbnail,
      manager,
      team: [manager],
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, client, search } = req.query;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    let query: any = {};

   
    if (status) {
      query.status = status;
    }

 
    if (client) {
      query.client = { $regex: client, $options: 'i' };
    }

   
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
      ];
    }

   
    if (userRole === UserRole.MEMBER) {
      query.team = userId;
    }

    const projects = await Project.find(query)
      .populate('manager', 'name email avatar')
      .populate('team', 'name email avatar role')
      .sort('-createdAt');

 
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const tasks = await Task.find({ project: project._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((task) => task.status === 'Done').length;

        return {
          ...project.toObject(),
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
      count: projectsWithStats.length,
      data: projectsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar')
      .populate('team', 'name email avatar role department skills');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }


    const userId = req.user?._id;
    const userRole = req.user?.role;
    const isTeamMember = project.team.some(
      (member: any) => member._id.toString() === userId?.toString()
    );

    if (userRole === UserRole.MEMBER && !isTeamMember) {
      res.status(403).json({ success: false, message: 'Not authorized to access this project' });
      return;
    }

  
    const tasks = await Task.find({ project: project._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === 'Done').length;
    const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length;

    const projectWithStats = {
      ...project.toObject(),
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    };

    res.status(200).json({
      success: true,
      data: projectWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
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

    let project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }


    const userId = req.user?._id;
    const userRole = req.user?.role;
    const isManager = project.manager.toString() === userId?.toString();

    if (userRole === UserRole.MEMBER && !isManager) {
      res.status(403).json({ success: false, message: 'Not authorized to update this project' });
      return;
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('manager', 'name email avatar').populate('team', 'name email avatar');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

  
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const isManager = project.manager.toString() === userId?.toString();

    if (userRole !== UserRole.ADMIN && !isManager) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
      return;
    }

    await project.deleteOne();


    await Task.deleteMany({ project: project._id });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const addTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }


    if (project.team.includes(userId)) {
      res.status(400).json({ success: false, message: 'User is already in the team' });
      return;
    }

    project.team.push(userId);
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('manager', 'name email avatar')
      .populate('team', 'name email avatar role');

    res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

export const removeTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }


    if (project.manager.toString() === userId) {
      res.status(400).json({ success: false, message: 'Cannot remove project manager' });
      return;
    }

    project.team = project.team.filter(
      (memberId) => memberId.toString() !== userId
    );
    await project.save();

    const updatedProject = await Project.findById(projectId)
      .populate('manager', 'name email avatar')
      .populate('team', 'name email avatar role');

    res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};