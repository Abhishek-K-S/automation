//action and data to be sent by iot
export type CommData<T> = {endPoint: string, payload: T, device?: string, senderId?: string}

export const commActions = {
    registerDevice: "REG_NEW",
    confirmRegistration: 'REG_CON',

    getStatus: 'G_STAT',
    updatedStatus: 'U_STAT',
    startImmediate: 'IMMST',
    stopImmediate: 'IMMSP',

    ping: 'P', 
    pong: 'PG',

    errorAction: "ERR"

}

export type getStatus = null

export type updatedStatus = {
    runningState: boolean,
    phase: number,
    voltage: [number, number, number],
    manual?:boolean,
    time: number,
    _id: string,
    request: string,
}

export type startImmediate = null
export type stopImmediate = null

export type getLogs = null
export type receiveLogs = {action: string, success: boolean, _createdTime: Date, _id: string}[]

export type errorAction = {message: string, reason: string, _id?: string, request: string}