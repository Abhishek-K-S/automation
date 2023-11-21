import dotenv from 'dotenv';
dotenv.config();

import { io } from 'socket.io-client'
import { socketEvents } from './src/shared/constants';
import { socketRequestHandler } from './src/socketRequestHandler';

const serverURL = process.env.SERVER_URL || ''
const domainName = process.env.DOMAIN || 'QU'

const socket = io(serverURL)

socket.on('connect', ()=>{
    console.log('connected to the server');
    socket.emit(socketEvents.register, {domain: domainName})
})

socket.on(socketEvents.relayMessageToServer, socketRequestHandler)
socket.on(socketEvents.registerSuccess, (status)=>console.log('register status success: ', status))

function replyToUser(msg: any): void{
    console.log('message to send ', msg)
    socket.emit(socketEvents.relayMessageToUser, msg )
}


// //grpc logic
// const grpcServer = new grpc.Server()
// grpcServer.addService(pumpDataTransferService, grpcDataTransferHandlers)

import connect from './src/database/connect';
import { sendToUser } from './src/utils/socketEmitter';
connect();
const DeviceHelper = require('./src/Devices/DeviceHandler');

console.log('type of ', typeof DeviceHelper.deviceOffline)
require('./src/mqtt/mqttServer');


sendToUser.on(socketEvents.relayMessageToUser, replyToUser);



//grcp server listening
// grpcServer.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, reservedPort)=>{
//     if(err){
//         console.log('could not start the server due to ', err);
//         return;
//     }
//     console.log('listening on port ', reservedPort);
//     grpcServer.start();
//     grpcServer.register
// })

const loopForever = () => { 
    setTimeout(loopForever, 3000)
}

loopForever();

