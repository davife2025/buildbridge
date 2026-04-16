import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { pitchRouter } from './routes/pitch';
import { errorHandler } from './middleware/error-handler';
import { notFound } from './middleware/not-found';

const app = express();
const PORT = process.env['API_PORT'] ?? 4000;

// ── Security ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env['WEB_URL'] ?? 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// ── Middleware ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));

// ── Routes ────────────────────────────────────────────────
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);     // ✅ Session 2
app.use('/api/pitch', pitchRouter);   // ✅ Session 3

// Session 5: milestone routes
// app.use('/api/milestones', milestoneRouter);

// Session 7: investor routes
// app.use('/api/investors', investorRouter);

// ── Error handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
if (process.env['NODE_ENV'] !== 'test') {
  app.listen(PORT, () => {
    console.log(`🌉 BuildBridge API → http://localhost:${PORT}`);
    console.log(`   Network: ${process.env['STELLAR_NETWORK'] ?? 'testnet'}`);
    console.log(`   Claude model: claude-sonnet-4-20250514`);
  });
}

export default app;
