import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './mongo'; 
import userRouter from '../Routes/userRoutes'; 
import companyRouter from '../Routes/companyRoutes'; 
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


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', userRouter);

app.use('/company', companyRouter);


export default app;
