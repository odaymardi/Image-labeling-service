import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import uploadRoutes from './routes/uploadRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import { connectDB } from './config/db.js'; // <-- NEW
import { __dirname } from './utils/path.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
console.log(__dirname);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api', uploadRoutes);
app.use('/api', imageRoutes);

// Connect to DB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
