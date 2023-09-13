import logger from "../model/Logger"

const logsToFetch = 20;

export const Logger = async (action: string, refId: string, message?: string) => {
    let entry = {action, requestId: refId} as any
    if(message) entry.outcome =  message
    let newEntry = await logger.create(entry).catch(err=>console.log('Database entry erorr', JSON.stringify(err)))
    return newEntry?._id;
}

export const updateLog = (_id: string, message: string, isError: boolean) =>{
    let toUpdate = {outcome: message, isError}
    logger.updateOne({_id}, toUpdate).catch(err=>console.log('Database update error', JSON.stringify(err)))
}

export const getLogs =async  (multiplier: number) =>{
    return logger.find([{$sort: {updatedAt: -1}}, {$limit: (multiplier * logsToFetch)}]).skip((multiplier-1) * logsToFetch)
}