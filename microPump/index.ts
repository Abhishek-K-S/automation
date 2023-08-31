import dotenv from 'dotenv';
dotenv.config();


import grpcClient from './src/grpcClient';
import mqttserve from './src/mqtt/mqttServer';

// const port = process.env.PORT || '7001'

const loopForever = () => { 
    console.log('looping forever')
    setTimeout(loopForever, 3000)
}

loopForever();
