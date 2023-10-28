import * as mqtt from 'mqtt'
import grpcClient from '../grpcClient';
import { WithAuth, WithoutAuth, socketEndpoints } from '../shared/constants';
import { commActions, updatedStatus, errorAction } from '../shared/endCommConstants'
import {v4 as uuidv4} from 'uuid'
import { Logger, getLogs, updateLog } from '../database/Logger';

const mqttBrokerUrl = process.env.MQTT_BROKER || ''

const serverId = process.env.SERVER_ID || ""
const pingTimeout = 5000;

class mqttServer {
    private client: mqtt.MqttClient;
    private devices: Set<string>
    constructor(){
        this.devices = new Set<string>();
        this.client = mqtt.connect(mqttBrokerUrl)

        this.client.subscribe(commActions.registerDevice)

        this.client.on('connect', ()=>{
            this.client.publish(socketEndpoints.reconnect, "");
        })

        this.client.on('message', this.mqttMessageHandler.bind(this))
    }

    private sendMessageToDevice(id: string|undefined, topic: string, message?: string){
        if(id && topic)
            this.client.publish(`dev/${id}/${topic}`, message || '', {qos:2})
        console.log('emitting to the device ', `dev/${id}/${topic}`)
    }

    async userMessageHandler(userRequest: WithAuth){
        console.log('received usr message')
        try{
            switch(userRequest.endPoint){
                //micro service layer requests
                case socketEndpoints.getDeviceList: 
                    if(!userRequest.senderId) throw Error('no sender id');
                    let devicelist = Array(...(this.devices.values()))
                    grpcClient.sendResponseToServer({senderId: userRequest.senderId||"", payload: devicelist, endPoint: socketEndpoints.deviceList})
                break;

                case socketEndpoints.getLogs: 
                    //query db for the log, send only 20 recent records
                    if(!userRequest.senderId) throw Error('no sender id');
                    let multiplier = 1;
                    if(Number(userRequest.payload.offset)>0) multiplier = Number(userRequest.payload.offset)
                    getLogs(multiplier).then(val=>{
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
                        grpcClient.sendResponseToServer({senderId: userRequest.senderId||"", payload: toSend, endPoint: socketEndpoints.receiveLogs})
                    })
                break;
                default: 
                    if(!userRequest.device || userRequest.device.length == 0) throw new Error('offline');
                    if(userRequest.device && !this.devices.has(userRequest.device)) throw new Error('offline');
                    let action = ""
                    switch(userRequest.endPoint){
                        case socketEndpoints.getInfo: 
                            this.sendMessageToDevice(userRequest.device, commActions.getStatus); 
                        break;
        
                        case socketEndpoints.startImmediate:
                            if(!action) action = commActions.startImmediate
                        case socketEndpoints.stopImmediate:
                            if(!action) action = commActions.stopImmediate
                            let logId = await Logger(userRequest.endPoint, userRequest.senderId||'', `User "${userRequest.auth}" requested to ${action==commActions.startImmediate?"START": "STOP"}.`)
                            this.sendMessageToDevice(userRequest.device, action, `__support__${userRequest.deviceSecurity}__id__${String(logId)}`)
                        break;
                        default: throw Error('unknown operation');
                    }

            }             
        }
        catch(err){
            console.log('error', err);
            if(err === 'offline'){
                Logger(userRequest.endPoint, userRequest.senderId||'').then(entry=>{
                    if(entry){
                        updateLog(String(entry)||'', true , `device ${userRequest.device} is offline`)
                    }
                    grpcClient.sendResponseToServer({payload: {device: userRequest.device, message: 'Device is offline'}, endPoint: socketEndpoints.erorr})
                }).catch(()=>{})
            }
            //send this errror to the user..
        }
    }

    private mqttMessageHandler(topic:string, payload: Buffer){
        console.log('message reveived at the server' , topic, payload.toString());
        if(topic == commActions.registerDevice){
            const deviceId = String(payload.toString());
            this.devices.add(deviceId)

            this.client.subscribe([
                `dev/${deviceId}/${commActions.updatedStatus}`, 
                `dev/${deviceId}/${commActions.errorAction}`,
                `dev/${deviceId}/${commActions.offline}`,
            ]);
            console.log('new device added');
            this.sendMessageToDevice(deviceId, commActions.confirmRegistration);
            return;
        }
        else
            try{
                const message = JSON.parse(String(payload.toString())) as  any
                const fragments = topic.split('/');
                const messageType = fragments[2];
                const deviceId = fragments[1];
                if(messageType && deviceId && this.devices.has(deviceId)){
                    switch(messageType){
                        case commActions.offline: 
                            this.devices.delete(deviceId);
                            Logger("Went offline", "", `Device ${deviceId} went offline.`)
                        break;

                        case commActions.updatedStatus: 
                            if(message._id){
                                updateLog(JSON.parse(JSON.stringify(message._id)), false);
                                delete message._id
                            }
                            message.time = new Date().getTime();
                            grpcClient.sendResponseToServer({device: deviceId, endPoint: socketEndpoints.info, payload: message})
                        break;

                        case commActions.errorAction: 
                                //log the event to the database based on the id
                            if(message._id){}
                            else Logger((message as errorAction).request, "", (message as errorAction).reason)
                            grpcClient.sendResponseToServer({device: deviceId, endPoint: socketEndpoints.erorr, payload: message, senderId: message._id})
            
                        break;

                        default: console.log('action not accepted')
                    }
                }
            }
            catch(e){
                console.log('Improper message format')
            }
    }
}

// (topic:string, payload: Buffer)
const mqttserve = new mqttServer()

export default mqttserve