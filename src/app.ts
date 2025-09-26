import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import ErrorResponse from './utils/errorResponse';
import errorHandler from './middlewares/errorHandler';
import cors from 'cors'
import morgan from 'morgan';
import userRoutes from './routes/user';
import authRoutes from "./routes/auth";

dotenv.config();
const app = express();

// Body parser middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));


app.use(cors());

// HTTP request logging
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);


// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: `Welcome!` });
});


app.use((req: Request, res: Response, next: NextFunction) => {
  return next(new ErrorResponse(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error handler
app.use(errorHandler);

export default app;
