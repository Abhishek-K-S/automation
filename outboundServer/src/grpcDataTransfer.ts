import { IpumpDataTransferServer } from './shared/gRPC/pumpDataTransfer_grpc_pb'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb'
import grpc from '@grpc/grpc-js'
import {requestHandler} from './grpcHandler'

class grpcDataTransfer implements IpumpDataTransferServer{
    streamData(call: grpc.ServerDuplexStream<requestData, responseData>, callback:grpc.sendUnaryData<responseData>): void {
        call.on('data', (data: requestData)=>{
            requestHandler(data)
        })
        call.on('end', ()=>{
            
        })
    }
}