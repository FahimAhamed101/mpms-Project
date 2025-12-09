import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import sprintRoutes from './routes/sprint.routes';
import taskRoutes from './routes/task.routes';
import teamRoutes from './routes/team.routes';
import reportRoutes from './routes/report.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();


app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/reports', reportRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});


app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});


app.use(errorHandler);

export default app;