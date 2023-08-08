// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var pumpDataTransfer_pb = require('./pumpDataTransfer_pb.js');

function serialize_requestData(arg) {
  if (!(arg instanceof pumpDataTransfer_pb.requestData)) {
    throw new Error('Expected argument of type requestData');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_requestData(buffer_arg) {
  return pumpDataTransfer_pb.requestData.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_responseData(arg) {
  if (!(arg instanceof pumpDataTransfer_pb.responseData)) {
    throw new Error('Expected argument of type responseData');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_responseData(buffer_arg) {
  return pumpDataTransfer_pb.responseData.deserializeBinary(new Uint8Array(buffer_arg));
}


var pumpDataTransferService = exports.pumpDataTransferService = {
  streamData: {
    path: '/pumpDataTransfer/streamData',
    requestStream: true,
    responseStream: true,
    requestType: pumpDataTransfer_pb.requestData,
    responseType: pumpDataTransfer_pb.responseData,
    requestSerialize: serialize_requestData,
    requestDeserialize: deserialize_requestData,
    responseSerialize: serialize_responseData,
    responseDeserialize: deserialize_responseData,
  },
};

exports.pumpDataTransferClient = grpc.makeGenericClientConstructor(pumpDataTransferService);
