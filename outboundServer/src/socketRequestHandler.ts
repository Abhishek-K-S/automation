import { EventEmitter } from "stream";
import { sendResponseToPumpMicroService } from "./grpcHandler";
import { generateToken, verifyToken } from "./jwt";
import { errorTypes, MicroServices, socketEndpoints, socketEvents, WithAuth, WithoutAuth } from "./shared/constants";

const domainName = process.env.DOMAIN || 'QU'

export const socketRequestHandler = (message: WithAuth) =>{
    switch(message.endPoint){
        case socketEndpoints.init:
            console.log('user requesting login');
            //login logic, reutrn auth token, independent of the service provided.
            try{
                if(typeof message.auth === 'string' || !message.auth.secret || !message.auth.username) throw Error()
                // check if user is auth, if so
                let isAuth = true;
                if(isAuth){
                    let authForUser = generateToken(message.auth.username);
                    localEmitter(socketEndpoints.initSuccesss, authForUser, undefined, message.senderId )
                }
                else throw new Error();

            }
            catch(err){
                localErrorEmitter(errorTypes.authfail, "User not authorised, wrong credentials", message.senderId);
            }
        break;
        default: 
            try{
                if(typeof message.auth !== 'string' || !verifyToken(message.auth)) throw Error();
                switch(message.service){
                    case MicroServices.PUMP: 
                        sendResponseToPumpMicroService(message);
                    break;
                    default: console.log('error requesting, not a valid service', message.endPoint)
                }

            }catch(err){
                localErrorEmitter(errorTypes.authfail, "User not authorised, login again", message.senderId)
            }
    }
}

export const localEmitter = (endPoint: string, payload: any, service?: number, to?: string) =>{
    let dataToSend:WithoutAuth = {
        endPoint,
        payload,
    }
    if(service !== undefined || service !== null) dataToSend['service'] = service
    if(to?.length) dataToSend['senderId'] = to; else dataToSend['domain'] = domainName;
    localSocketIOEmitter.emit(socketEvents.relayMessageToUser, dataToSend)
}

export const localErrorEmitter = (type: string, message: string, senderId?: string) => {
    localSocketIOEmitter.emit(socketEvents.relayMessageToUser, {type, message, senderId})
}

export const localSocketIOEmitter = new EventEmitter()