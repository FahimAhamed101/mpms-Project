import { Request, Response, NextFunction } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import User from '../models/User';
import Sprint from '../models/Sprint';

export const getProjectProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('manager', 'name email')
      .populate('team', 'name email role');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

  
    const tasks = await Task.find({ project: projectId })
      .populate('assignees', 'name email')
      .populate('sprint', 'title sprintNumber');

 
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const reviewTasks = tasks.filter(task => task.status === 'Review').length;
    const todoTasks = tasks.filter(task => task.status === 'To Do').length;

 
    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);

 
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;


    const tasksByPriority = {
      low: tasks.filter(task => task.priority === 'low').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      high: tasks.filter(task => task.priority === 'high').length,
      urgent: tasks.filter(task => task.priority === 'urgent').length,
    };

  
    const now = new Date();
    const overdueTasks = tasks.filter(task => 
      task.dueDate < now && task.status !== 'Done'
    ).length;

    res.status(200).json({
      success: true,
      data: {
        project: {
          id: project._id,
          title: project.title,
          client: project.client,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          progress,
        },
        statistics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          reviewTasks,
          todoTasks,
          totalEstimatedHours,
          totalActualHours,
          efficiency: totalActualHours > 0 
            ? Math.round((totalEstimatedHours / totalActualHours) * 100) 
            : 0,
          overdueTasks,
        },
        tasksByStatus: {
          'To Do': todoTasks,
          'In Progress': inProgressTasks,
          'Review': reviewTasks,
          'Done': completedTasks,
        },
        tasksByPriority,
        upcomingDeadlines: tasks
          .filter(task => task.status !== 'Done' && task.dueDate > now)
          .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
          .slice(0, 5)
          .map(task => ({
            id: task._id,
            title: task.title,
            dueDate: task.dueDate,
            status: task.status,
            assignees: task.assignees,
          })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserWorkload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;

    const currentUserId = req.user?._id;
    const currentUserRole = req.user?.role;

    if (currentUserRole === 'member' && currentUserId?.toString() !== userId) {
      res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view other users workload' 
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }


    const tasks = await Task.find({ assignees: userId })
      .populate('project', 'title client')
      .populate('sprint', 'title sprintNumber');


    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;


    const totalEstimatedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);


    const tasksByProject: Record<string, any> = {};
    tasks.forEach(task => {
      const projectId = (task.project as any)._id.toString();
      if (!tasksByProject[projectId]) {
        tasksByProject[projectId] = {
          project: task.project,
          tasks: [],
          completed: 0,
          total: 0,
        };
      }
      tasksByProject[projectId].tasks.push(task);
      tasksByProject[projectId].total++;
      if (task.status === 'Done') {
        tasksByProject[projectId].completed++;
      }
    });


    const projects = Object.values(tasksByProject).map((proj: any) => ({
      project: proj.project,
      completed: proj.completed,
      total: proj.total,
      completionRate: Math.round((proj.completed / proj.total) * 100),
    }));

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
        workload: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks: totalTasks - completedTasks - inProgressTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          totalEstimatedHours,
          totalActualHours,
          efficiency: totalActualHours > 0 
            ? Math.round((totalEstimatedHours / totalActualHours) * 100) 
            : 0,
        },
        projects,
        recentActivity: tasks
          .filter(task => task.updatedAt)
          .sort((a, b) => b.updatedAt!.getTime() - a.updatedAt!.getTime())
          .slice(0, 10)
          .map(task => ({
            id: task._id,
            title: task.title,
            project: task.project,
            status: task.status,
            lastUpdated: task.updatedAt,
          })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSprintReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sprintId } = req.params;

    const sprint = await Sprint.findById(sprintId)
      .populate('project', 'title client');

    if (!sprint) {
      res.status(404).json({ success: false, message: 'Sprint not found' });
      return;
    }


    const tasks = await Task.find({ sprint: sprintId })
      .populate('assignees', 'name email')
      .populate('project', 'title');


    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;

  
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    
    const velocity = daysPassed > 0 ? completedTasks / daysPassed : 0;
    const projectedCompletion = velocity > 0 ? Math.ceil((totalTasks - completedTasks) / velocity) : 0;

  
    const burnDownData = [];
    for (let i = 0; i <= Math.min(daysPassed, totalDays); i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
  
      const tasksNotDone = tasks.filter(task => 
        task.status !== 'Done' && 
        (!task.completedAt || task.completedAt > date)
      ).length;
      
      burnDownData.push({
        day: i + 1,
        date,
        tasksRemaining: tasksNotDone,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        sprint: {
          id: sprint._id,
          title: sprint.title,
          sprintNumber: sprint.sprintNumber,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          goal: sprint.goal,
          progress: sprint.progress,
        },
        statistics: {
          totalTasks,
          completedTasks,
          inProgressTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          daysRemaining: Math.max(0, totalDays - daysPassed),
          velocity: velocity.toFixed(2),
          projectedCompletionDays: projectedCompletion,
        },
        burnDownChart: burnDownData,
        taskStatusBreakdown: {
          'To Do': tasks.filter(task => task.status === 'To Do').length,
          'In Progress': inProgressTasks,
          'Review': tasks.filter(task => task.status === 'Review').length,
          'Done': completedTasks,
        },
        topPerformers: tasks
          .filter(task => task.status === 'Done')
          .reduce((acc: Record<string, number>, task) => {
            task.assignees.forEach((assignee: any) => {
              const userId = assignee._id.toString();
              acc[userId] = (acc[userId] || 0) + 1;
            });
            return acc;
          }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?._id;

    let projectQuery: any = {};
    let taskQuery: any = {};

  
    if (userRole === 'member') {
      projectQuery.team = userId;
      taskQuery.assignees = userId;
    }

 
    const totalProjects = await Project.countDocuments(projectQuery);
    const totalTasks = await Task.countDocuments(taskQuery);
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalSprints = await Sprint.countDocuments();

 
    const activeProjects = await Project.countDocuments({ ...projectQuery, status: 'active' });

 
    const todoTasks = await Task.countDocuments({ ...taskQuery, status: 'To Do' });
    const inProgressTasks = await Task.countDocuments({ ...taskQuery, status: 'In Progress' });
    const reviewTasks = await Task.countDocuments({ ...taskQuery, status: 'Review' });
    const doneTasks = await Task.countDocuments({ ...taskQuery, status: 'Done' });


    const now = new Date();
    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      dueDate: { $lt: now },
      status: { $ne: 'Done' },
    });


    const recentTasks = await Task.find(taskQuery)
      .populate('project', 'title')
      .populate('assignees', 'name')
      .sort('-updatedAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProjects,
          activeProjects,
          totalTasks,
          totalUsers,
          totalSprints,
        },
        taskStatus: {
          todo: todoTasks,
          inProgress: inProgressTasks,
          review: reviewTasks,
          done: doneTasks,
          overdue: overdueTasks,
        },
        recentActivities: recentTasks.map(task => ({
          id: task._id,
          title: task.title,
          project: task.project,
          status: task.status,
          updatedAt: task.updatedAt,
          assignees: task.assignees,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};