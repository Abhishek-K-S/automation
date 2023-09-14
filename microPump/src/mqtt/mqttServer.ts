import * as mqtt from 'mqtt'
import grpcClient from '../grpcClient';
import { WithoutAuth, socketEndpoints } from '../shared/constants';
import { commActions, updatedStatus, errorAction } from '../shared/endCommConstants'
import {v4 as uuidv4} from 'uuid'
import { Logger, getLogs, updateLog } from '../database/Logger';

const mqttBrokerUrl = process.env.MQTT_BROKER || ''

const serverId = process.env.SERVER_ID || ""
const pingTimeout = 5000;

class mqttServer {
    private client: mqtt.MqttClient;
    private devices: Set<string>
    private pingListernQueue: Map<string, ()=>void>;
    constructor(){
        this.devices = new Set<string>()
        this.pingListernQueue = new Map<string, ()=>void>();
        this.client = mqtt.connect(mqttBrokerUrl)

        this.client.subscribe(commActions.registerDevice)

        this.client.on('message', this.mqttMessageHandler.bind(this))
    }

    private sendMessageToDevice(id: string|undefined, topic: string, message?: string){
        if(id && topic)
        this.client.publish(`dev/${id}/${topic}`, message || '', {qos:2})
    }

    async userMessageHandler(userRequest: WithoutAuth){
        try{
            switch(userRequest.endPoint){
                //micro service layer requests
                case socketEndpoints.getDeviceList: 
                    if(!userRequest.senderId) throw Error('no sender id');
                    grpcClient.sendResponseToServer({senderId: userRequest.senderId||"", payload: Array(this.devices.values()), endPoint: socketEndpoints.deviceList})
                break;

                case socketEndpoints.getLogs: 
                    //query db for the log, send only 20 recent records
                    if(!userRequest.senderId) throw Error('no sender id');
                    let multiplier = 1;
                    if(Number(userRequest.payload.offset)>0) multiplier = Number(userRequest.payload.offset)
                    getLogs(multiplier).then(val=>{
                        grpcClient.sendResponseToServer({senderId: userRequest.senderId||"", payload: val, endPoint: socketEndpoints.receiveLogs})
                    })
                break;
                default: 
                    await this.isDeviceOnline(userRequest.device).catch(err=>{
                        //device is offline
                        Logger(userRequest.endPoint, userRequest.senderId||'').then(entry=>{
                            if(entry){
                                updateLog(String(entry)||'', true , `device ${userRequest.device} is offline`)
                            }
                            grpcClient.sendResponseToServer({payload: {device: userRequest.device, message: 'Device is offline'}, endPoint: socketEndpoints.erorr})
                            throw Error('Device is offline, aborting...')
                        })

                    })
                    let action = ""
                    switch(userRequest.endPoint){
                        case socketEndpoints.getInfo: 
                            this.sendMessageToDevice(userRequest.device, commActions.getStatus); 
                        break;
        
                        case socketEndpoints.startImmediate:
                            if(!action) action = 'START'
                        case socketEndpoints.stopImmediate:
                            if(!action) action = 'STOP'
                            let logId = await Logger(userRequest.endPoint, userRequest.senderId||'', `user ${userRequest.senderId} requested to ${action}`)
                            this.sendMessageToDevice(userRequest.device, commActions.startImmediate, JSON.stringify({support: userRequest.deviceSecurity, _id: String(logId)}))
                        break;
                        default: throw Error('unknown operation');
                    }

            }             
        }
        catch(err){
            console.log('error', err);
            //send this errror to the user..
        }
    }

    isDeviceOnline(deviceId: string|undefined): Promise<void>{
        return new Promise((res, rej)=>{
            if(!deviceId || deviceId.length == 0) rej(false)
            let reqId = uuidv4();
            const timer = setTimeout(()=>{
                this.pingListernQueue.delete(reqId);
                rej(false);
            }, pingTimeout)

            this.sendMessageToDevice(deviceId, commActions.ping, reqId);

            this.pingListernQueue.set(reqId, ()=>{
                clearTimeout(timer);
                res();
                this.pingListernQueue.delete(reqId);
            })
        })
    }

    private mqttMessageHandler(topic:string, payload: Buffer|string){
        console.log('message reveived at the server');
        if(topic == commActions.registerDevice){
            const deviceId = String(payload);
            this.devices.add(deviceId)

            this.client.subscribe([
                `dev/${deviceId}/${commActions.updatedStatus}`, 
                `dev/${deviceId}/${commActions.errorAction}`
            ]);

            this.sendMessageToDevice(deviceId, commActions.confirmRegistration);
            return;
        }
        else
            try{
                const message = JSON.parse(String(payload)) as  errorAction|updatedStatus;
                const fragments = topic.split('/');
                const messageType = fragments[2];
                const deviceId = fragments[1];
                if(messageType && deviceId && this.devices.has(deviceId)){
                    switch(messageType){

                        ////check if server is available; commAction.isAlive
                        case commActions.pong: 
                            let cb = this.pingListernQueue.get(messageType);
                            if(cb){
                                cb();
                            }
                        break;

                        case commActions.updatedStatus: 
                            if(message._id){
                                updateLog(JSON.parse(JSON.stringify(message._id)), false);
                                delete message._id
                            }
                            grpcClient.sendResponseToServer({device: deviceId, endPoint: socketEndpoints.info, payload: message})
                        break;
                        case commActions.errorAction: 
                                //log the event to the database based on the id
                            if(message._id)
                                updateLog(message._id, true)
                            else Logger(message.request, "", (message as errorAction).reason)
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