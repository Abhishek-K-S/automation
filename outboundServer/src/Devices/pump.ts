import { Logger, getLogWithId, getLogs, updateLog } from "../database/Logger";
import { mqttMessageSend } from "../mqtt/mqttServer";
import { WithAuth, socketEndpoints } from "../shared/constants";
import { commActions, errorAction } from "../shared/endCommConstants";
import { sendDataToUser } from "../utils/socketEmitter";

const handleUserRequest =async (userRequest: WithAuth) => {
    console.log('received usr message')
    try{
        switch(userRequest.endPoint){
            case socketEndpoints.getLogs: 
                //query db for the log, send only 20 recent records
                if(!userRequest.senderId) throw Error('no sender id');
                let multiplier = 1;
                if(Number(userRequest.payload.offset)>0) multiplier = Number(userRequest.payload.offset)
                if(userRequest.targetDevice) 
                    getLogs(multiplier, userRequest.targetDevice).then(val=>{
                        let toSend: any[] = []
                        for(let entry of val.docs){
                            toSend.push({
                                _id: entry._id,
                                time: (entry as any).updatedAt,
                                outcome: (entry as any).outcome,
                                isError: (entry as any).isError
                            })
                            console.log('entry is', entry)

                        }
                        sendDataToUser(socketEndpoints.receiveLogs, toSend,{to: userRequest.senderId})
                    })
            break;
            default: 
                let action = ""
                switch(userRequest.endPoint){
                    case socketEndpoints.getInfo: 
                        mqttMessageSend(userRequest.targetDevice||'', commActions.getStatus); 
                    break;
    
                    case socketEndpoints.startImmediate:
                        if(!action) action = commActions.startImmediate
                    case socketEndpoints.stopImmediate:
                        if(!action) action = commActions.stopImmediate
                        let logId = await Logger(userRequest.targetDevice||'abc', userRequest.endPoint, userRequest.senderId||'', `User "${userRequest.auth}" requested to ${action==commActions.startImmediate?"START": "STOP"}.`)
                        mqttMessageSend(userRequest.targetDevice||'', action, `__support__${userRequest.deviceSecurity}__id__${String(logId)}`)
                    break;
                    default: throw Error('unknown operation');
                }

        }             
    }
    catch(err){
        console.log('error', err);
        // if(err === 'offline'){
        //     Logger(userRequest.endPoint, userRequest.senderId||'').then(entry=>{
        //         if(entry){
        //             updateLog(String(entry)||'', true , `device ${userRequest.targetDevice} is offline`)
        //             sendDataToUser(socketEndpoints.receiveLogs, [{_id: String(entry), isError: true, outcome: `device ${userRequest.targetDevice} is offline`, action: userRequest.endPoint, requestId: userRequest.senderId}], {})
        //         }
        //         // replyWith({payload: {device: userRequest.targetDevice, message: 'Device is offline'}, endPoint: socketEndpoints.erorr})
        //     }).catch(()=>{})
        // }
        //send this errror to the user..
    }
}

async function handleDeviceResponse(topic:string, payload: Buffer){
        try{
            const message = JSON.parse(String(payload.toString())) as  any
            const fragments = topic.split('/');
            const messageType = fragments[2];
            const deviceId = fragments[1];
            let logId = message?._id;
            if(messageType && deviceId){
                switch(messageType){
                    case commActions.updatedStatus: 
                        if(message._id){
                            updateLog(JSON.parse(JSON.stringify(message._id)), false);
                            delete message._id
                        }
                        else{
                            logId = await Logger(deviceId, "Manual Operation", "", message.reason)
                        }
                        message.time = new Date().getTime();
                        sendDataToUser(socketEndpoints.info, message, {targetDevice: deviceId})
                    break;

                    case commActions.errorAction: 
                            //log the event to the database based on the id
                        logId = message?._id;
                        if(message._id){
                            updateLog(String(message._id), true, message.reason)
                        }
                        else logId = await Logger(deviceId, (message as errorAction).request, "", (message as errorAction).reason)
                        sendDataToUser(socketEndpoints.erorr, message, {targetDevice: deviceId, to: message._id})        
                    break;

                    default: console.log('action not accepted')
                }
                logId?.length && getLogWithId(logId).then((data: any)=>{
                    sendDataToUser(socketEndpoints.receiveLogs, {_id: data?._id, time: data.updatedAt, outcome: data.outcome, isError: data.isError},{});
                }) 
            }
        }
        catch(e){
            console.log('Improper message format')
        }
}

export default {handleUserRequest, handleDeviceResponse}