import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './mongo'; 
import userRouter from '../Routes/userRoutes'; 
import companyRouter from '../Routes/companyRoutes'; 
import adminRouter from '../Routes/adminRoutes'; 
import cors from 'cors'; 
import http from 'http'; // Import http module
import cookieParser from 'cookie-parser'; // Import cookie-parser
import {initializeSocket} from '../socket/socket'
dotenv.config();

const app = express();
const server = http.createServer(app); 

connectDB();
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'
};


app.use(cors(corsOptions));
app.use(cookieParser())
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed

// Increase the limit for URL-encoded payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
initializeSocket(server);
app.use('/', userRouter);
app.use('/company', companyRouter);
app.use('/admin', adminRouter);



export default server;
