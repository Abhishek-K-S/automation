import { EventEmitter } from "stream";
import { WithoutAuth, socketEvents } from "../shared/constants";

export const sendToUser = new EventEmitter();

const domainName = process.env.DOMAIN || 'QU'

export const replyWith = (data:any)=>{
    sendToUser.emit(socketEvents.relayMessageToUser, data)
}

export const sendDataToUser = (endPoint: string, payload: any, opt: {to?: string, targetDevice?: string}) =>{
    let dataToSend:WithoutAuth = {
        endPoint,
        payload,
    }
    if(opt.to?.length) dataToSend['senderId'] = opt.to; else dataToSend['domain'] = domainName;
    if(opt.targetDevice) dataToSend.targetDevice = opt.targetDevice;
    console.log(JSON.stringify(dataToSend))
    replyWith(dataToSend);
}

export const localErrorEmitter = (type: string, message: string, opt: {to?: string, targetDevice?: string}) => {
    replyWith({error: true, type, message, senderId: opt.to, targetDevice: opt.targetDevice})
}