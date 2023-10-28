import { EventEmitter } from "stream";
import { sendResponseToPumpMicroService } from "./grpcHandler";
import { generateToken, verifyToken } from "./jwt";
import { errorTypes, MicroServices, socketEndpoints, socketEvents, WithAuth, WithoutAuth } from "./shared/constants";
import DB from './db/auth'

const domainName = process.env.DOMAIN || 'QU'

export const socketRequestHandler = (message: WithAuth) =>{
    switch(message.endPoint){
        case socketEndpoints.init:
            console.log('user requesting login', JSON.stringify(message));
            //login logic, reutrn auth token, independent of the service provided.
            try{
                if(typeof message.auth === 'string' || !message.auth.secret || !message.auth.username) throw Error()
                // check if user is auth, if so
                console.log('is auth is ', DB.isAuth(message.auth.username, message.auth.secret))
                let authForUser = generateToken(message.auth.username);
                localEmitter(socketEndpoints.initSuccesss, authForUser, undefined, message.senderId )
                console.log('auto for user', authForUser)
            }
            catch(err){
                console.log('encoutnerd some issue, ', err)
                localErrorEmitter(errorTypes.authfail, "User not authorised, wrong credentials", message.senderId);
            }
        break;
        default: 
            try{
                if(typeof message.auth !== 'string')  throw Error();

                let valid = verifyToken(message.auth)

                if(!valid[0]) throw Error();

                message.auth = valid[1];
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

export const localEmitter = (endPoint: string, payload: any, service?: number, to?: string, device?: string) =>{
    let dataToSend:WithoutAuth = {
        endPoint,
        payload,
    }
    if(service !== undefined || service !== null) dataToSend['service'] = service
    if(to?.length) dataToSend['senderId'] = to; else dataToSend['domain'] = domainName;
    if(device) dataToSend['device'] = device;
    localSocketIOEmitter.emit(socketEvents.relayMessageToUser, dataToSend);
}

export const localErrorEmitter = (type: string, message: string, senderId?: string) => {
    localSocketIOEmitter.emit(socketEvents.relayMessageToUser, {type, message, senderId})
}

export const localSocketIOEmitter = new EventEmitter()