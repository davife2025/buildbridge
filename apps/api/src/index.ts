import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { pitchRouter } from './routes/pitch';
import { milestoneRouter } from './routes/milestone';
import { profileRouter } from './routes/profile';
import { investorRouter } from './routes/investor';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';

const app = express();
const PORT = process.env['API_PORT'] ?? 4000;

app.use(helmet());
app.use(cors({ origin: process.env['WEB_URL'] ?? 'http://localhost:3000', credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);              // ✅ Session 2
app.use('/api/pitch', pitchRouter);            // ✅ Session 3
app.use('/api/milestones', milestoneRouter);   // ✅ Session 5
app.use('/api/profiles', profileRouter);       // ✅ Session 6
app.use('/api/investors', investorRouter);     // ✅ Session 7

app.use(notFound);
app.use(errorHandler);

if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌉 BuildBridge API → http://localhost:${PORT}`);
    console.log(`   Network: ${process.env['STELLAR_NETWORK'] ?? 'testnet'}`);
  });
}

export default app;
