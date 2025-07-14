import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import data from "./data.js";
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import crypto from 'crypto';
import cookieParser from "cookie-parser";


dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With', 
        'Content-Type', 
        'Accept',
        'Authorization',
        'Cookie'
      ],
      exposedHeaders: ['Set-Cookie']
}));


app.use(helmet());




// routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);



//Global Error Handler
app.use(errorHandler);



const port = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI, {  
}).then(() => {
    console.log("database connection");
    // optional : seed data
    // Product.insertMany(data.products)
    // console.log(crypto.randomBytes(32).toString('hex'));
    app.listen(port, () => {
        console.log(`server is running in http://localhost:${port}/`)
    });
}).catch((error) => console.log(`${error}`));

