import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import movieRoutes from './routes/movie.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/movies', movieRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`?? Backend API engine running on http://localhost:${PORT}`);
  });
});
