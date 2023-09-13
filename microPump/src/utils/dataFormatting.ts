import { WithoutAuth, PropsWithoutAuth } from "../shared/constants";
import { CommData, errorAction, updatedStatus } from "../shared/endCommConstants";

export const createStructuredDataToSend= (data:any)=>{
    return data as WithoutAuth
}