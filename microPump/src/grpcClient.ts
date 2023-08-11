import * as grpc from '@grpc/grpc-js'
import { CommData } from './shared/endCommConstants';
import { WithAuth, WithoutAuth } from './shared/constants';
import { IpumpDataTransferClient, pumpDataTransferClient } from './shared/gRPC/pumpDataTransfer_grpc_pb'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb';
import { createStructuredDataToSend } from './utils/dataFormatting';

const grpcServerPort = process.env.GRPC_SERVER_PORT || '6999'

class grpcClientLogic {
    private grpcCall: grpc.ClientDuplexStream<requestData, responseData>
    constructor(){
        const grpcClient = new pumpDataTransferClient(`127.0.0.1:${grpcServerPort}`, grpc.credentials.createInsecure());

        this.grpcCall = grpcClient.streamData()

        this.grpcCall.on('data', (chunk:responseData)=>{
            //logic to handle
            let receivedData = JSON.parse(chunk.getRes()) as WithAuth
            //verify user
            //handle request based on action send by the user;

        })

        this.grpcCall.on('end', ()=>{
            console.log('server stopped, ending the call')

            this.grpcCall.end();
        })
    }

    sendResponseToServer(message:CommData<any>){
        const dataToSend: WithoutAuth = createStructuredDataToSend(message)
        const response = new requestData();
        response.setReq(JSON.stringify(dataToSend));
        this.grpcCall.write(response)
    }
}

const grpcClient = new grpcClientLogic();

export default grpcClient;