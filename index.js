import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';

import router from './routes/index.js';

dotenv.config();
const app = express();

const whitelist = ['http://localhost:3000', 'http://localhost:3001'];
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(router);

app.listen(5000, () => {
  console.log('Server running at port 5000');
});
