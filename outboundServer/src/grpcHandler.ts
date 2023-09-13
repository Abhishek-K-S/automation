import grpc from '@grpc/grpc-js'
import { MicroServices, WithAuth, WithoutAuth } from './shared/constants'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb'
import { localEmitter, localSocketIOEmitter } from './socketRequestHandler'

type listenerType = (response: responseData)=>void

let clientListener: listenerType | null  = null
export const setPumpMicroServiceListener = (fn: listenerType)=> clientListener = fn

export const grpcRequestHandler = (grpcRequest: requestData) =>{
    let dataFromGrpcClient = JSON.parse(grpcRequest.getReq()) as WithoutAuth
    localEmitter(dataFromGrpcClient.endPoint, dataFromGrpcClient.payload, MicroServices.PUMP, dataFromGrpcClient.senderId);
}


export const sendResponseToPumpMicroService = (dataForPumpService: WithAuth) =>{
    let responseDataCopy = new responseData()
    let dataToSend : any = dataForPumpService
    delete dataToSend['service']
    delete dataToSend['auth']
    delete dataToSend['domain']
    responseDataCopy.setRes(JSON.stringify(dataToSend))
    if(clientListener) clientListener(responseDataCopy)
}