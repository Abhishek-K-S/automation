// package: 
// file: pumpDataTransfer.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class requestData extends jspb.Message { 
    getReq(): string;
    setReq(value: string): requestData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): requestData.AsObject;
    static toObject(includeInstance: boolean, msg: requestData): requestData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: requestData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): requestData;
    static deserializeBinaryFromReader(message: requestData, reader: jspb.BinaryReader): requestData;
}

export namespace requestData {
    export type AsObject = {
        req: string,
    }
}

export class responseData extends jspb.Message { 
    getRes(): string;
    setRes(value: string): responseData;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): responseData.AsObject;
    static toObject(includeInstance: boolean, msg: responseData): responseData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: responseData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): responseData;
    static deserializeBinaryFromReader(message: responseData, reader: jspb.BinaryReader): responseData;
}

export namespace responseData {
    export type AsObject = {
        res: string,
    }
}
