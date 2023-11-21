import { EventEmitter } from "stream";

const me = new EventEmitter();

export const mqttEmit = (topic:string, payload:Buffer) =>{
    me.emit('msg', topic, payload)
}

export const mqttOn = (sub: (topic: string, payload: Buffer)=>void) =>{
    me.on('msg', (topic: string, payload: Buffer)=> {if(topic && payload) sub(topic, payload);console.log(topic, payload)});
}