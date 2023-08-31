const regServers = new Map<string, string>();
const serverLists: string[] = []
const whiteList : {[key: string]: string[]} = {}

export const getSocketIdFor = (domain: string): string | undefined =>{
    return regServers.get(domain)
}

export const saveDomainName = (domain: string, socketId: string) => {
    if(domain?.length <=12 && socketId && !regServers.has(domain)){
        regServers.set(domain, socketId)
        serverLists.push(socketId);
        return true;
    }
    return false;
}

export const serverListSize = () =>{
    return regServers.size
}

export const removeParticipant = (socketId: string) =>{
    let ind = serverLists.indexOf(socketId);
    if( ind > -1 ){
        for(let [key, value] of regServers.entries()){
            if(value== socketId){
                regServers.delete(key);
                break;
            }
        }
        serverLists.splice(ind , 1);
    }
}