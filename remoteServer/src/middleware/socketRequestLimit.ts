
import { ExtendedError } from "socket.io/dist/namespace"
import {Event as socketEvent} from 'socket.io/dist/socket'

export const socketReqestLimiter = (ms: number) =>{
    const eventMap = new Map<string, number>()
    return (socket: socketEvent, next: (err?: ExtendedError | undefined) => void) =>{
        const now = Date.now();
        const lastRequestTime = eventMap.get(socket[0])
        if(!lastRequestTime || (now - lastRequestTime) >= ms){
            eventMap.set(socket[0], now);
            next()
            return;
        }
        next(new Error(`Speed limit is: ${ms} sec`))
    }
}