export const socketEvents = {
    relayMessageToServer: 'RELAY_TO_SERVER',
    relayMessageToUser: 'RELAY_TO_USER', 

    register: "REG_NEW",
    registerSuccess: 'REG_SCS', 
}

export const socketEndpoints = {
    init: 'INIT_NEW',
    initSuccesss: 'INIT_SCS',
    
    erorr: "ERR",

    addNewUser: "AUSER",

    getInfo: "GET_INFO",
    info: 'INFO',

    startImmediate: "STR_IMM",
    stopImmediate: "STP_IMM"
}

export const errorTypes = {
    authfail: 'NO_AUTH'
}

export const ServerLimit = 5
export const MicroServices = {
    PUMP: 0
}

//action: event type,         type: type of micro srver
export type RemoteData = {domain?: string, senderId?: string}

export type WithoutAuth<T=any> = {
    device?: string, 
    domain?: string, 
    senderId?: string, 
    endPoint: string, 
    service?: number, 
    payload: T 
}
export type WithAuth<T=any> = {auth: string | {username: string, secret: string}} & WithoutAuth<T>

export type WithError = {type: string, message: string, senderId: string};

export const PropsWithoutAuth:string[] = [
    'dest',
    'action',
    'type',
    'data'
];

export const PropsWithAuth: string[] = [
    ...PropsWithoutAuth,
    'auth'
]