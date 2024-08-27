import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './mongo'; 
import userRouter from '../Routes/userRoutes'; 
import companyRouter from '../Routes/companyRoutes'; 
import adminRouter from '../Routes/adminRoutes'; 
import cors from 'cors'; 

dotenv.config();

const app = express();


connectDB();
const corsOptions = {
  origin: ' http://localhost:5173', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization'
};


app.use(cors(corsOptions));


app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit as needed

// Increase the limit for URL-encoded payloads
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/', userRouter);
app.use('/company', companyRouter);
app.use('/admin', adminRouter);



export default app;
