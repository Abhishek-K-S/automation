import * as jwt from 'jsonwebtoken'
import {v4 as uuidv4} from 'uuid'
import DB from './db/auth'

const secret = process.env.SECRET || "secretDidn't load";

export type VerifyToken = [boolean, string]

export const generateToken = (username: string) => {
    let userSecret = uuidv4()
    DB.setToken(username, userSecret);
    //save the uuid and username in the db
    const payload = {username, userSecret}
    return jwt.sign(payload, secret)
}

export const verifyToken = (token: string):VerifyToken =>{
    let decoded:any = jwt.verify(token, secret);
    if(decoded.username, decoded.userSecret){
        let storedToken = DB.getToken(decoded.username) as any
        if(storedToken?.token === decoded.userSecret)
            return [true, decoded.username];
    }
    return [false, ""];
}