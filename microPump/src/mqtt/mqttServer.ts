import * as mqtt from 'mqtt'
import grpcClient from '../grpcClient';
import { WithoutAuth, socketEndpoints } from '../shared/constants';
import { commActions, updatedStatus, errorAction } from '../shared/endCommConstants'
import {v4 as uuidv4} from 'uuid'

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
                    grpcClient.sendResponseToServer({senderId: userRequest.senderId||"", payload: [], endPoint: socketEndpoints.receiveLogs})
                break;
                default: 

                //these messages needs to be sent to the end devices. veriy if they r alive
                    //isalive, if so
                    await this.isDeviceOnline(userRequest.device)
                    switch(userRequest.endPoint){
                        case socketEndpoints.getInfo: 
                            this.sendMessageToDevice(userRequest.device, commActions.getStatus); 
                        break;
        
                        case socketEndpoints.startImmediate:
                        case socketEndpoints.stopImmediate:
                            //log for start, wait for to get updated, for the sake of record
                            // replace record id with database entry id
                            let recordId = uuidv4()
                            //make db entry, partially updated entry, wait for 5 seconds
                            this.sendMessageToDevice(userRequest.device, commActions.startImmediate, JSON.stringify({support: userRequest.deviceSecurity, recordId}))
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
                const message = JSON.parse(String(payload)) as errorAction|updatedStatus;
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
                            grpcClient.sendResponseToServer({device: deviceId, endPoint: socketEndpoints.info, payload: message})
                        break;
                        case commActions.errorAction: 
                                //log the event to the database based on the id
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