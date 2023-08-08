import grpc from '@grpc/grpc-js';
import dotenv from 'dotenv';
import {io} from 'socket.io-client'
import { MicroServices, socketEvents, WithAuth } from './src/shared/constants';
import { verifyUser } from './src/verify';
import protoLoader from '@grpc/proto-loader'
import { pumpDataTransferService } from './src/shared/gRPC/pumpDataTransfer_grpc_pb'
import { grpcRequestListener, sendResponse } from './src/grpcHandler';

dotenv.config();

const port = process.env.PORT;
const serverURL = process.env.SERVER_URL || ''
const myId = process.env.MY_ID || ''
const myPassword = process.env.MY_PASSWORD || ''  
const packageDefinition = protoLoader.loadSync('./src/shared/gRPC/pumpDataTransfer.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const proto = grpc.loadPackageDefinition(packageDefinition).pumpDataTransfer as unknown as (typeof pumpDataTransferService)


const socket = io(serverURL)
const grpcServer = new grpc.Server()
grpcServer.addService(pumpDataTransferService., {

})

socket.on('connect', ()=>{
    console.log('server connected to '+ serverURL)
})

socket.on(socketEvents.relayMessageToServer, (skt: WithAuth) =>{
    if(!verifyUser(skt.auth, myId, myPassword)) return;
    switch(skt.type){
        case MicroServices.PUMP: 
            //grpc to connect to the other micro srvice
            sendResponse(skt)
        break;
    }
})

grpcRequestListener.on(socketEvents.relayMessageToUser, replyToUser)

function replyToUser(msg: any): void{
    socket.emit(socketEvents.relayMessageToUser, msg )
}


//grpc receiver to do all those stuff


//loop forever to listen to all of teh events

