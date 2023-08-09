import { IpumpDataTransferServer } from './shared/gRPC/pumpDataTransfer_grpc_pb'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb'
import grpc from '@grpc/grpc-js'
import {requestHandler, setListener} from './grpcHandler'

export const grpcDataTransfer: IpumpDataTransferServer ={
    streamData: (call: grpc.ServerDuplexStream<requestData, responseData>)=>{
        setListener((req: responseData)=>{call.write(req)})
        call.on('data', (request:requestData) => {
            requestHandler(request)
        });
    
        call.on('end', () => {
            console.log('connection ended with gRPC')
            // Cleanup or final actions
            call.end();
        });
    }
} 