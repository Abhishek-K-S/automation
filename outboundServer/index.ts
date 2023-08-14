import *  as grpc from '@grpc/grpc-js';
import dotenv from 'dotenv';
import {io} from 'socket.io-client'
import { MicroServices, socketEvents, WithAuth } from './src/shared/constants';
// import { verifyUser } from './src/verify';
import { pumpDataTransferService } from './src/shared/gRPC/pumpDataTransfer_grpc_pb'
import { grpcRequestListener, sendResponseToPumpMicroService } from './src/grpcHandler';
import { grpcDataTransferHandlers } from './src/grpcDataTransfer';

dotenv.config();

const port = process.env.PORT || '6999'
const serverURL = process.env.SERVER_URL || ''
const myId = process.env.MY_ID || ''
const myPassword = process.env.MY_PASSWORD || ''  


const grpcServer = new grpc.Server()
grpcServer.addService(pumpDataTransferService, grpcDataTransferHandlers)

const socket = io(serverURL)
socket.on('connect', ()=>{
    console.log('server connected to '+ serverURL)
})

socket.on(socketEvents.relayMessageToServer, (skt: WithAuth) =>{
    // if(!verifyUser(skt.auth, skt.dest, myPassword)) return;
    switch(skt.type){
        case MicroServices.PUMP: 
            //grpc to connect to the other micro service, pump in this case
            sendResponseToPumpMicroService(skt)
        break;
    }
})

grpcRequestListener.on(socketEvents.relayMessageToUser, replyToUser)

function replyToUser(msg: any): void{
    socket.emit(socketEvents.relayMessageToUser, msg )
}


//grcp server listening
grpcServer.bindAsync(`127.0.0.1:${port}`, grpc.ServerCredentials.createInsecure(), (err, reservedPort)=>{
    if(err){
        console.log('could not start the server due to ', err);
        return;
    }
    console.log('listening on port ', reservedPort);
    grpcServer.start();
})

