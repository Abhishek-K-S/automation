import { WithoutAuth, PropsWithoutAuth } from "../shared/constants";
import { CommData, errorAction, updatedStatus } from "../shared/endCommConstants";

export const createStructuredDataToSend= (data:any)=>{
    console.log('data is ', data)
    let dataToSend: {[key: string]:any} = {}
    PropsWithoutAuth.forEach(prop=>{
        if(prop in data){
            dataToSend[prop] = data[prop] 
        }
    })
    
    return dataToSend as WithoutAuth
}