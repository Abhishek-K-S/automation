import dotenv from 'dotenv';
dotenv.config();

import connect from './src/database/connect';

connect();

require('./src/grpcClient');
require('./src/mqtt/mqttServer');

// const port = process.env.PORT || '7001'

const loopForever = () => { 
    setTimeout(loopForever, 3000)
}

loopForever();
