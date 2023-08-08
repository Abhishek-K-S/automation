// package: 
// file: pumpDataTransfer.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as pumpDataTransfer_pb from "./pumpDataTransfer_pb";

interface IpumpDataTransferService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    streamData: IpumpDataTransferService_IstreamData;
}

interface IpumpDataTransferService_IstreamData extends grpc.MethodDefinition<pumpDataTransfer_pb.requestData, pumpDataTransfer_pb.responseData> {
    path: "/pumpDataTransfer/streamData";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<pumpDataTransfer_pb.requestData>;
    requestDeserialize: grpc.deserialize<pumpDataTransfer_pb.requestData>;
    responseSerialize: grpc.serialize<pumpDataTransfer_pb.responseData>;
    responseDeserialize: grpc.deserialize<pumpDataTransfer_pb.responseData>;
}

export const pumpDataTransferService: IpumpDataTransferService;

export interface IpumpDataTransferServer {
    streamData: grpc.handleBidiStreamingCall<pumpDataTransfer_pb.requestData, pumpDataTransfer_pb.responseData>;
}

export interface IpumpDataTransferClient {
    streamData(): grpc.ClientDuplexStream<pumpDataTransfer_pb.requestData, pumpDataTransfer_pb.responseData>;
    streamData(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<pumpDataTransfer_pb.requestData, pumpDataTransfer_pb.responseData>;
    streamData(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<pumpDataTransfer_pb.requestData, pumpDataTransfer_pb.responseData>;
}

export class pumpDataTransferClient extends grpc.Client implements IpumpDataTransferClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public streamData(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<pumpDataTransfer_pb.requestData, pumpDataTransfer_pb.responseData>;
    public streamData(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<pumpDataTransfer_pb.requestData, pumpDataTransfer_pb.responseData>;
}
