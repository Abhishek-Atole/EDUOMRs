import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { responseMiddleware } from './middleware/response.js';
import { errorHandler } from './middleware/error.js';
import { globalLimiter, authLimiter, answerLimiter } from './middleware/rateLimiter.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { institutionRoutes } from './modules/institution/institution.routes.js';
import { planRoutes } from './modules/subscription/plan.routes.js';
import { paymentRoutes } from './modules/subscription/payment.routes.js';
import { subscriptionRoutes } from './modules/subscription/subscription.routes.js';
import { teacherRoutes } from './modules/teacher/teacher.routes.js';
import { studentRoutes } from './modules/student/student.routes.js';
import { parentRoutes } from './modules/parent/parent.routes.js';
import { userRoutes } from './modules/user/user.routes.js';
import { academicRoutes } from './modules/academic/academic.routes.js';
import { examRoutes } from './modules/exam/exam.routes.js';
import { questionRoutes } from './modules/question/question.routes.js';
import { answerKeyRoutes } from './modules/answer-key/answerKey.routes.js';
import { examSessionRoutes } from './modules/exam-session/examSession.routes.js';
import { submissionRoutes } from './modules/submission/submission.routes.js';
import { resultRoutes } from './modules/result/result.routes.js';
import { notificationRoutes } from './modules/notification/notification.routes.js';

const app = express();

app.set('trust proxy', 1);

app.use(compression());
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',').map((s) => s.trim()) : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));
app.use(hpp());
app.use(requestIdMiddleware);
app.use(responseMiddleware);
app.use(globalLimiter);

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(`/api/${env.API_VERSION}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customCss: '.swagger-ui .topbar { display: none }' }));

app.get(`/api/${env.API_VERSION}/health`, (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(`/api/${env.API_VERSION}/auth`, authLimiter, authRoutes);
app.use(`/api/${env.API_VERSION}/institutions`, institutionRoutes);
app.use(`/api/${env.API_VERSION}/plans`, planRoutes);
app.use(`/api/${env.API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${env.API_VERSION}/subscriptions`, subscriptionRoutes);
app.use(`/api/${env.API_VERSION}/teachers`, teacherRoutes);
app.use(`/api/${env.API_VERSION}/students`, studentRoutes);
app.use(`/api/${env.API_VERSION}/parents`, parentRoutes);
app.use(`/api/${env.API_VERSION}/users`, userRoutes);
app.use(`/api/${env.API_VERSION}/academic`, academicRoutes);
app.use(`/api/${env.API_VERSION}/exams`, examRoutes);
app.use(`/api/${env.API_VERSION}/questions`, questionRoutes);
app.use(`/api/${env.API_VERSION}/answer-keys`, answerKeyRoutes);
app.use(`/api/${env.API_VERSION}/exam-sessions`, examSessionRoutes);
app.use(`/api/${env.API_VERSION}/submissions`, answerLimiter, submissionRoutes);
app.use(`/api/${env.API_VERSION}/results`, resultRoutes);
app.use(`/api/${env.API_VERSION}/notifications`, notificationRoutes);

app.use(errorHandler);

export default app;
