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
import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();
// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000' ,
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

// Serve static files from client build (if serving full-stack)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

//Global Error Handler
app.use(errorHandler);



const PORT = process.env.PORT || 4000;
mongoose.connect(process.env.MONGO_URI, {  
}).then(() => {
    console.log("database connection");
    // optional : seed data
    // Product.insertMany(data.products)
    // console.log(crypto.randomBytes(32).toString('hex'));
    app.listen(PORT, () => {
        console.log(`server is running in http://localhost:${PORT}/`)
    });
}).catch((error) => console.log(`${error}`));

