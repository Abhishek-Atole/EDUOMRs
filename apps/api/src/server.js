import app from './app.js';
import { env } from './config/env.js';
import './jobs/notification.worker.js';
import './jobs/evaluation.worker.js';
import './jobs/auto-submit.worker.js';
import './jobs/dead-letter.worker.js';

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
