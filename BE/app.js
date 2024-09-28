import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "path"

import connectToMongo from './config/db.js';
import routes from './routes/routes.js';
import { cronRunner } from './cron/cron.js';

const app = express();
dotenv.config();
const port = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'dist/algo-ui')));

app.use('/api', routes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/algo-ui/index.html'));
});

cronRunner();

app.listen(port, async () => {
  await connectToMongo();
  console.log(`Server is running on http://localhost:${port}`);
});
