import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', version: '2.0.0' });
});

// API routes
app.get('/api/petitions', (req: Request, res: Response) => {
  // TODO: Implement petition fetching
  res.json({ petitions: [] });
});

// Start server
app.listen(port, () => {
  console.log(`⚡️ Speak Up V2 backend running on port ${port}`);
});

export default app;
