import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Project from '../models/Project';

export const getTeamMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { search, department, role } = req.query;
    const userRole = req.user?.role;

    let query: any = { isActive: true };


    if (userRole === 'manager') {
      query.role = { $in: ['member', 'manager'] };
    } else if (userRole === 'member') {
      query._id = req.user?._id; 
    }


    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    if (role) {
      query.role = role;
    }


    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await User.find(query)
      .select('-password')
      .sort('name');

   
    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        const projects = await Project.find({ team: member._id });
        const tasks = await require('../models/Task').default.find({ assignees: member._id });

        const activeTasks = tasks.filter((task: { status: string; }) => 
          task.status !== 'Done' && task.status !== 'Archived'
        ).length;

        return {
          ...member.toObject(),
          stats: {
            projectCount: projects.length,
            totalTasks: tasks.length,
            activeTasks,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      count: membersWithStats.length,
      data: membersWithStats,
    });
  } catch (error) {
    next(error);
  }
};

export const createTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role, department, skills } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

  
    if (role === 'admin' && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only admins can create admin users' });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member',
      department,
      skills,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        skills: user.skills,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role, department, skills, isActive } = req.body;

  
    const currentUserRole = req.user?.role;
    const targetUser = await User.findById(id);

    if (!targetUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }


    if ((role || isActive !== undefined) && currentUserRole !== 'admin') {
      res.status(403).json({ 
        success: false, 
        message: 'Only admins can update roles or deactivate users' 
      });
      return;
    }


    if (targetUser.role === 'admin' && currentUserRole !== 'admin') {
      res.status(403).json({ 
        success: false, 
        message: 'Cannot modify admin users' 
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;
    if (skills !== undefined) updateData.skills = skills;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTeamMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

  
    if (req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Only admins can delete users' });
      return;
    }

    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

 
    if (user._id.toString() === req.user?._id?.toString()) {
      res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      return;
    }

 
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
};