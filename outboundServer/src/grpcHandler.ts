import grpc from '@grpc/grpc-js'
import { EventEmitter } from 'stream'
import { WithAuth, WithoutAuth } from './shared/constants'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb'
import { socketEvents } from './shared/constants'

type listenerType = (response: responseData)=>void

let clientListener: listenerType | null  = null
export const grpcRequestListener = new EventEmitter();

export const setListener = (fn: listenerType)=> clientListener = fn

export const requestHandler = (data: requestData) =>{
    let content = JSON.parse(data.getReq()) as WithoutAuth
    grpcRequestListener.emit( socketEvents.relayMessageToUser, content)
}


export const sendResponse = (content: WithAuth) =>{
    let responseDataCopy = new responseData()
    responseDataCopy.setRes(JSON.stringify(content))
    if(clientListener) clientListener(responseDataCopy)
}