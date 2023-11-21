import { generateToken, verifyToken } from "./jwt";
import { errorTypes, socketEndpoints, WithAuth, WithoutAuth } from "./shared/constants";
import DB from './db/auth'
import { userMessageHandler } from "./Devices/DeviceHandler";
import { sendDataToUser, localErrorEmitter, replyWith } from "./utils/socketEmitter";

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
                sendDataToUser(socketEndpoints.initSuccesss, authForUser, {to: message.senderId} )
                console.log('auto for user', authForUser)
            }
            catch(err){
                console.log('encoutnerd some issue, ', err)
                localErrorEmitter(errorTypes.authfail, "User not authorised, wrong credentials", {to:message.senderId});
            }
        break;
        default: 
            try{
                if(typeof message.auth !== 'string')  throw Error();

                let valid = verifyToken(message.auth)

                if(!valid[0]) throw Error();

                message.auth = valid[1];

                userMessageHandler(message);

            }catch(err){
                localErrorEmitter(errorTypes.authfail, "User not authorised, login again", {to: message.senderId})
            }
    }
}