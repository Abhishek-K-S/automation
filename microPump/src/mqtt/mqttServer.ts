import * as mqtt from 'mqtt'
import grpcClient from '../grpcClient';
import { WithAuth } from '../shared/constants';
import { commActions, updatedStatus, errorAction } from '../shared/endCommConstants'
import { verifyUser } from '../utils/verify';
const mqttBrokerUrl = process.env.MQTT_BROKER || ''

const serverId = process.env.SERVER_ID || ""

class mqttServer {
    private client: mqtt.MqttClient;
    private devices: Set<string>
    constructor(){
        this.devices = new Set<string>()
        this.client = mqtt.connect(mqttBrokerUrl)

        this.client.subscribe(commActions.registerDevice)

        this.client.on('message', this.mqttMessageHandler.bind(this))
    }

    private sendMessageToDevice(id: string, topic: string, message?: string){
        if(id && topic)
        this.client.publish(`dev/${id}/${topic}`, message || '', {qos:2})
    }

    userMessageHandler(userRequest: WithAuth){
        if(verifyUser(userRequest.auth, userRequest.dest, userRequest.support) && userRequest.action && this.devices.has(userRequest.dest)){
            switch(userRequest.action){
                case commActions.getStatus: 
                    //when u get a request, just relay it to the iot device to get its state, if no reply in 5 seconds, declare as device offline
                    this.sendMessageToDevice(userRequest.dest, userRequest.action, JSON.stringify({support: userRequest.support}))
                break;

                case commActions.startImmediate:
                case commActions.stopImmediate:
                    //log for start, wait for to get updated, for the sake of record
                    this.sendMessageToDevice(userRequest.dest, userRequest.action, JSON.stringify({support: userRequest.support, recordId: '1234'}))
                break;

                case commActions.getLogs: 
                    //query db for the log, send only 20 recent reconrds
                break;
            }
        }
    }

    private mqttMessageHandler(topic:string, payload: Buffer|string){
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
        
        try{
            const message = JSON.parse(String(payload)) as errorAction|updatedStatus
            const fragments = topic.split('/')
            const messageType = fragments[2]
            const deviceId = fragments[1]
            if(messageType && deviceId && this.devices.has(deviceId)){
                switch(messageType){

                    ////check if server is available; commAction.isAlive

                    case commActions.updatedStatus: 
                    case commActions.errorAction: 

                        if(message?._id){
                            //log the event to the database based on the id
                        }
                        else{
                            //normal log entry, maybe manual, check for that toooo.
                        }
                        delete message._id
                        grpcClient.sendResponseToServer({action: messageType, data: message, dest: deviceId})

        
                    break;
                    default: console.log('action not accepted')
                }
    
                //make log entries here with respective events
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