export const socketEvents = {
    init: 'SOCKET_INIT',

    relayMessageToServer: 'RELAY_TO_SERVER',
    relayMessageToUser: 'RELAY_TO_USER',
    register: "REG_SRV"
}

export const socketServer = {

}

export const ServerLimit = 5

export type WithoutAuth = {dest: string, action: string, data:any}
export type WithAuth = {auth: string} & WithoutAuth