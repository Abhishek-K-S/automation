import dotenv from 'dotenv';
dotenv.config();


import *  as grpc from '@grpc/grpc-js';
import {io} from 'socket.io-client'
import { socketEvents } from './src/shared/constants';
import { pumpDataTransferService } from './src/shared/gRPC/pumpDataTransfer_grpc_pb'
import { grpcDataTransferHandlers } from './src/grpcDataTransfer';
import { localSocketIOEmitter, socketRequestHandler } from './src/socketRequestHandler';



const port = process.env.PORT || '6999'
const serverURL = process.env.SERVER_URL || ''
const domainName = process.env.DOMAIN || 'QU'

console.log('domain name is ', domainName)

//socket logic
const socket = io(serverURL)

socket.on('connect', ()=>{
    console.log('connected to the server');
    socket.emit(socketEvents.register, {domain: domainName})
})

socket.on(socketEvents.relayMessageToServer, socketRequestHandler)
socket.on(socketEvents.registerSuccess, (status)=>console.log('register status success: ', status))

function replyToUser(msg: any): void{
    socket.emit(socketEvents.relayMessageToUser, msg )
}


//grpc logic
const grpcServer = new grpc.Server()
grpcServer.addService(pumpDataTransferService, grpcDataTransferHandlers)

localSocketIOEmitter.on(socketEvents.relayMessageToUser, replyToUser)



//grcp server listening
grpcServer.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, reservedPort)=>{
    if(err){
        console.log('could not start the server due to ', err);
        return;
    }
    console.log('listening on port ', reservedPort);
    grpcServer.start();
})

