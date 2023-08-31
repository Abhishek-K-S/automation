import * as jwt from 'jsonwebtoken'
import uuid from 'uuid'

const secret = process.env.SECRET || "secretDidn't load";

export const generateToken = (username: string) => {
    let userSecret = uuid.v4()
    //save the uuid and username in the db
    const payload = {username, userSecret}
    return jwt.sign(payload, secret)
}

export const verifyToken = (token: string) =>{
    let decoded:any = jwt.verify(token, secret);
    if(decoded.username, decoded.userSecret){
        //check in db if the username adn userSecret do match, else return error
        return true;
    }
    return false;
}