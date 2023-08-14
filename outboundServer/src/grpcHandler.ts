import grpc from '@grpc/grpc-js'
import { EventEmitter } from 'stream'
import { MicroServices, WithAuth, WithoutAuth } from './shared/constants'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb'
import { socketEvents } from './shared/constants'

type listenerType = (response: responseData)=>void

let clientListener: listenerType | null  = null
export const setPumpMicroServiceListener = (fn: listenerType)=> clientListener = fn


export const grpcRequestListener = new EventEmitter();

export const grpcRequestHandler = (grpcRequest: requestData) =>{
    let dataFromGrpcClient = JSON.parse(grpcRequest.getReq()) as WithoutAuth
    //add fields to the dataFromGrpcClient to such as 
    dataFromGrpcClient.type = MicroServices.PUMP
    grpcRequestListener.emit( socketEvents.relayMessageToUser, dataFromGrpcClient)
}


export const sendResponseToPumpMicroService = (dataForPumpService: WithAuth) =>{
    let responseDataCopy = new responseData()
    delete dataForPumpService['type']
    responseDataCopy.setRes(JSON.stringify(dataForPumpService))
    if(clientListener) clientListener(responseDataCopy)
}