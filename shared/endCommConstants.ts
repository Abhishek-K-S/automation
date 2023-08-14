//action and data to be sent by iot
export type CommData<T> = {action: string, data: T, dest: string}

export const commActions = {
    registerDevice: "REG_NEW",
    confirmRegistration: 'REG_CON',

    getStatus: 'G_STAT',
    updatedStatus: 'U_STAT',
    startImmediate: 'IMMST',
    stopImmediate: 'IMMSP',

    getLogs: 'LOGS',
    receiveLogs: 'LOGS_LIST',

    errorAction: "ERR"

}

export type getStatus = null

export type updatedStatus = {
    runningState: boolean,
    phase: number,
    voltage: [number, number, number],
    manual?:boolean,
    lastUpdate: Date,
    _id?: string
}

export type startImmediate = null
export type stopImmediate = null

export type getLogs = null
export type receiveLogs = {action: string, success: boolean, _createdTime: Date, _id: string}[]

export type errorAction = {message: string, reason: string, _id?: string}