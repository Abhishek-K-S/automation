import { ScheduleTypeFromDevice, Schedule, WithAuth, socketEvents } from "../shared/constants";
import {v4 as uuidv4} from 'uuid'
import * as nodeScheduler from 'node-schedule'
import { localMessageEmitter } from "../utils/socketEmitter";

let scheduledActions: Schedule[] = []

nodeScheduler.scheduleJob('cronEvery2Sec', '/2 * * * * *', (d)=>{
    let now = d.getTime()
    scheduledActions.forEach((sh)=>{
        if(sh.action.triggerAt.getTime() <= now){
            triggerAction(sh)
        }
    })
})

export const Scheduler = {
    create : (req: WithAuth<ScheduleTypeFromDevice>) =>{
                let ref = req.payload
                if(!ref || ref.actions.length == 0||!req.targetDevice){
                    //no need of doing the action
                    return;
                }
                //Log here for reference
                ref.actions.forEach(action=>{
                    let groupId = uuidv4()
                    scheduledActions.push({
                        groupId,
                        action,
                        retry: ref?.retry||false,
                        createdBy: typeof req.auth == 'string'? req.auth:'',
                        targetDevice: req.targetDevice||''
                    })
                })
            },
    remove : (req: WithAuth<{_id: string}>) => {
                if(req.payload){
                    scheduledActions = scheduledActions.filter(entry=>{
                        return entry.groupId !== req.payload?._id
                    })
                }
            },
    getAll : () =>{
                return structuredClone(scheduledActions);
            }
}

const triggerAction = async (sh: Schedule)=>{
    let msg: WithAuth = {
        targetDevice: sh.targetDevice,
        endPoint: sh.action.actionName,
        auth: sh.createdBy,
        payload: sh.groupId
    }
    localMessageEmitter.emit(socketEvents.relayMessageToServer, msg)
}