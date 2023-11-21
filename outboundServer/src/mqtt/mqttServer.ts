import * as mqtt from 'mqtt'
import { socketEndpoints } from '../shared/constants';
import { commActions} from '../shared/endCommConstants'
import { mqttEmit } from '../utils/mqttEmitter';

const mqttBrokerUrl = process.env.MQTT_BROKER || ''


var client = mqtt.connect(mqttBrokerUrl)

client.subscribe(commActions.registerDevice)
client.subscribe(commActions.offline)

client.on('connect', ()=>{
    console.log('connected');
    client.publish(socketEndpoints.reconnect, "");
})

client.on('message', (topic, buf)=>mqttEmit(topic, buf));
console.log("mqtt file executing");

export const mqttSubscribe = (topic: string|string[]) => {
    client.subscribe(topic);
}

export const mqttUnsubscribe = (topic: string|string[]) =>{
    client.unsubscribe(topic);
}

export function mqttMessageSend(deviceId: string, topic: string, message?: string){
    if(client && deviceId && topic)
        client.publish(`dev/${deviceId}/${topic}`, message || '', {qos:2})
    console.log('emitting to the device ', `dev/${deviceId}/${topic}`)
}