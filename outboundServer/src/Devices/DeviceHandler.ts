import { mqttSubscribe, mqttMessageSend, mqttUnsubscribe } from "../mqtt/mqttServer";
import { DeviceTypes, WithAuth, socketEndpoints } from "../shared/constants";
import { commActions } from "../shared/endCommConstants";
import { mqttOn } from "../utils/mqttEmitter";
import { sendDataToUser } from "../utils/socketEmitter";
import { handleDeviceResponse, handleUserRequest } from "./pump";

let deviceList = new Map<string, string>();

export const userMessageHandler = (message: WithAuth) =>{
    try{
        if(!message.senderId) throw new Error('no sender id');
        if(message.endPoint === socketEndpoints.getDeviceList){
            sendDevicelistToUser(message.senderId);
            return;
        }
        if(!message.targetDevice || !deviceList.has(message.targetDevice)) return false;
        let operationDeviceType = deviceList.get(message.targetDevice);
    
        switch(operationDeviceType){
            //pump type
            case DeviceTypes[0]:
                handleUserRequest(message);
            break;
            default: throw Error("Unkown device type");
        }
    }
    catch(e){
        console.log(e);
    }
}

mqttOn(deviceMessageHandler);

function deviceMessageHandler(topic:string, payload:Buffer){
    console.log('message reveived at the server' , topic, payload.toString());
    if(topic == commActions.registerDevice){
        const deviceId = payload.toString().split(",");
        if(!deviceId[0] || !deviceId[1]) return;
        if(registerDevice(deviceId[0], deviceId[1])){
            mqttSubscribe([
                `dev/${deviceId[0]}/${commActions.updatedStatus}`, 
                `dev/${deviceId[0]}/${commActions.errorAction}`
            ]);
            console.log('new device added');
            //on registering , send some auth to the iot device, for going offline anytime
            mqttMessageSend(deviceId[0], commActions.confirmRegistration);
        }
        return;
    }
    if(topic == commActions.offline){
        const deviceId = payload.toString().split(",");
        if(!deviceId[0] || !deviceId[1]) return;
        //deviceId[1] would be the auth code of iot device to register offline status
        mqttUnsubscribe([
            `dev/${deviceId[0]}/${commActions.updatedStatus}`, 
            `dev/${deviceId[0]}/${commActions.errorAction}`
        ]);
        deviceOffline(deviceId[0])
        return;
    }

    let operationType = deviceList.get(topic.split("/")[1]);
    if(!operationType){
        console.log('device may not have regiserd;')
        return;
    }
    switch(operationType){
        case DeviceTypes[0]:
            //pump type
            handleDeviceResponse(topic, payload);
        break;
    }
}

export const registerDevice = (id: string, type: string) => {
    if(!deviceList.has(id) && DeviceTypes.includes(type.toUpperCase())){
        deviceList.set(id, type);
        sendDevicelistToUser();
        return true;
    }
    return false
}

export const deviceOffline = (id:string) => {
    if(id && deviceExists(id)) {
        deviceList.delete(id);
        sendDevicelistToUser();
    }
}

const deviceExists = (id: string)=> deviceList.has(id)

const sendDevicelistToUser = (senderId?: string) =>{
    let dlist: any[] = []
    deviceList.forEach((value, key)=>{
        dlist.push({deviceId: key, type: value})
    })
    sendDataToUser(socketEndpoints.deviceList, dlist, {to: senderId})
}