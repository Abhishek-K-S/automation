import dotenv from 'dotenv';
dotenv.config();


import grpcClient from './src/grpcClient';

const port = process.env.PORT || '7001'
