import { useSelector } from "react-redux"
import { getAuthSelector } from "./utils"

export default function useSocketRequestGenerator(device: string) {
    const authObject = useSelector(getAuthSelector);
    return (endPoint: string)=>{
        return {
            auth: authObject.auth || '',
            domain: authObject.domain || '',
            endPoint,
            targetDevice: device
        }
    }
}