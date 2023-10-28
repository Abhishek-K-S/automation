import * as grpc from '@grpc/grpc-js'
import { CommData } from './shared/endCommConstants';
import { WithAuth, WithoutAuth } from './shared/constants';
import { IpumpDataTransferClient, pumpDataTransferClient } from './shared/gRPC/pumpDataTransfer_grpc_pb'
import { requestData, responseData } from './shared/gRPC/pumpDataTransfer_pb';
import { createStructuredDataToSend } from './utils/dataFormatting';
import { verifyUser } from './utils/verify';
import mqttserve from './mqtt/mqttServer';

const grpcServerPort = process.env.GRPC_SERVER_PORT || '6999'

class grpcClientLogic {
    private grpcCall: grpc.ClientDuplexStream<requestData, responseData>
    constructor(){
        console.log('object created , waiting for grpcClient to initialize')
        const grpcClient = new pumpDataTransferClient(`127.0.0.1:${grpcServerPort}`, grpc.credentials.createInsecure());

        this.grpcCall = grpcClient.streamData()


        this.grpcCall.on('data', (chunk: responseData)=>{
            //logic to handle
            console.log('grpc data received', chunk)
            try{
                let receivedData = JSON.parse(chunk.getRes()) as WithAuth;
                mqttserve.userMessageHandler(receivedData)
            }
            catch(err){
                console.log('Data sent from outbound server is not proper')
            }
        })

        this.grpcCall.on('end', ()=>{
            console.log('server stopped, ending the call')
            this.grpcCall.end();
            //try reconnecting to the server
        })

        this.grpcCall.on('error', ()=>{
            console.log('got some error in grpc client')
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