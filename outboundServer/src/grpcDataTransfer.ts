import { IpumpDataTransferServer } from './shared/gRPC/pumpDataTransfer_grpc_pb'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb'
import grpc from '@grpc/grpc-js'
import { grpcRequestHandler, setPumpMicroServiceListener } from './grpcHandler'

export const grpcDataTransferHandlers: IpumpDataTransferServer ={
    streamData: (call: grpc.ServerDuplexStream<requestData, responseData>)=>{
        console.log('LOGGER: Stream data is being called')
        setPumpMicroServiceListener((req: responseData)=>{call.write(req, ()=>console.log("LOGGER: written to the stream"))});
        call.on('data', (request:requestData) => {
            grpcRequestHandler(request)
            //register the device, listen for that event that contain request property
        });
    
        call.on('end', () => {
            console.log('connection ended with gRPC')
            // Cleanup or final actions
            call.end();
        });
    }
} 