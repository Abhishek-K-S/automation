import { IpumpDataTransferServer } from './shared/gRPC/pumpDataTransfer_grpc_pb'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb'
import grpc from '@grpc/grpc-js'
import { grpcRequestHandler, setPumpMicroServiceListener } from './grpcHandler'

export const grpcDataTransferHandlers: IpumpDataTransferServer ={
    streamData: (call: grpc.ServerDuplexStream<requestData, responseData>)=>{
        setPumpMicroServiceListener((req: responseData)=>{call.write(req)})
        call.on('data', (request:requestData) => {
            grpcRequestHandler(request)
        });
    
        call.on('end', () => {
            console.log('connection ended with gRPC')
            // Cleanup or final actions
            call.end();
        });
    }
} 