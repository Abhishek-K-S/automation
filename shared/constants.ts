export const socketEvents = {
    relayMessageToServer: 'RELAY_TO_SERVER',
    relayMessageToUser: 'RELAY_TO_USER', 

    register: "REG_NEW",
    registerSuccess: 'REG_SCS', 
}

export const socketEndpoints = {
    //for outbound servers
    init: 'INIT_NEW',
    initSuccesss: 'INIT_SCS',
    
    erorr: "ERR",

    addNewUser: "AUSER",


    //for micro services
    getInfo: "GET_INFO",
    info: 'INFO',

    startImmediate: "STR_IMM",
    stopImmediate: "STP_IMM",

    getLogs: 'LOGS',
    receiveLogs: 'LOGS_LIST',

    getDeviceList: 'GDLIST',
    deviceList: 'DLIST',
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
    device?: string, //exists
    domain?: string, 
    senderId?: string, //sender socket id, exists
    endPoint: string,   //event endpoint
    service?: number, 
    payload: T,   //data to send
    deviceSecurity?: string  //authcode for device
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