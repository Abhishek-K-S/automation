import { io, Socket } from "socket.io-client";
import { serverURL } from "../constants/service";
import { WithAuth, WithoutAuth, socketEvents } from "../shared/constants";
import { socketListener } from "./socketEventListener";

let client: null | Socket = null;
let prevUrl: string = "";

export const connectToSocket = (url: string, onConnect: ()=>void) => {
    if(prevUrl == url){
        client && onConnect();
    }
    else{
        disconnectSocket();
        client = io(url);
        client.on('connect', () => {
            prevUrl = url;
            console.log('Connected to Socket.IO server', url);
            client && client.on(socketEvents.relayMessageToUser, (data: WithoutAuth)=>{
                console.log('[message from server]: ', data)
                socketListener.emit(data.endPoint, data);
            })
            if (onConnect) {
                onConnect();
            }
        });
    }

};

const disconnectSocket = () =>{
    client && client.disconnect()
}

export const socketEmit = (data: WithAuth) =>{
    console.log('request to emit', data)
    client && client.emit(socketEvents.relayMessageToServer, data)
}
