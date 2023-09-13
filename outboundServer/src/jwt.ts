import * as jwt from 'jsonwebtoken'
import uuid from 'uuid'
import DB from './db/auth'

const secret = process.env.SECRET || "secretDidn't load";

export const generateToken = (username: string) => {
    let userSecret = uuid.v4()
    DB.setToken(username, userSecret);
    //save the uuid and username in the db
    const payload = {username, userSecret}
    return jwt.sign(payload, secret)
}

export const verifyToken = (token: string) =>{
    let decoded:any = jwt.verify(token, secret);
    if(decoded.username, decoded.userSecret){
        let storedToken = DB.getToken(decoded.username) as any
        if(storedToken?.token === decoded.userSecret)
            return true;
    }
    return false;
}