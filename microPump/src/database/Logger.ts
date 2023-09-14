import logger from "../model/Logger"

const logsToFetch = 20;

export const Logger = async (action: string, refId: string, message?: string) => {
    let entry = {action, requestId: refId, isError: true} as any
    if(message) entry.outcome =  message
    let newEntry = await logger.create(entry).catch(err=>console.log('Database entry erorr', JSON.stringify(err)))
    return newEntry?._id;
}

export const updateLog = (_id: string, isError: boolean, message?: string|undefined) =>{
    let toUpdate = {isError} as any
    if(message) toUpdate.outcome = message;
    logger.updateOne({_id}, toUpdate).catch(err=>console.log('Database update error', JSON.stringify(err)))
}

export const getLogs =async  (multiplier: number) =>{
    return logger.find([{$sort: {updatedAt: -1}}, {$limit: (multiplier * logsToFetch)}]).skip((multiplier-1) * logsToFetch)
}