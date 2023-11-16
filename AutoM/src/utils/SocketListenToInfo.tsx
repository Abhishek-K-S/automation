import React from "react";
import { updatedStatus } from "../shared/endCommConstants";
import { socketListener } from "./socketEventListener";
import { WithoutAuth, socketEndpoints } from "../shared/constants";

export default function useSocketListenToInfo<T= {time:number}>(device:string, initialState: T): [T, string]{
    const [status, setStatus] = React.useState<T>(initialState)
    const time:number = (status as any).time || 0
    const lastUpdate = time  !== 0? String(new Date(time).toLocaleTimeString()):'N/A';

    React.useEffect(()=>{
        socketListener.addListener(socketEndpoints.info, (data:WithoutAuth<T>)=>{
            console.log('got payload at pump view', data?.payload, typeof data.payload=='string', data.targetDevice)
            if(data?.payload && data.targetDevice == device){
                console.log("all matching");
                setStatus(data.payload)
            }
                
        })

        return ()=>{
            console.log('destructuring');
            socketListener.removeAllListeners(socketEndpoints.info);
        }
    }, [])

    return [status, lastUpdate];
}