export const socketEvents = {
    init: 'SOCKET_INIT',

    relayMessageToServer: 'RELAY_TO_SERVER',
    relayMessageToUser: 'RELAY_TO_USER',
    register: "REG_SRV"
}

export const ServerLimit = 5
export const MicroServices = {
    PUMP: 0
}

//action: event type,         type: type of micro srver
export type WithoutAuth = {dest: string, action: number, type: number, data:any}
export type WithAuth = {auth: string} & WithoutAuth

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