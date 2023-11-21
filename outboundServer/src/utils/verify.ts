import bcrypt from 'bcrypt'

export const verifyUser = (hash: string, id: string, password: string): boolean =>{
    if(hash && id && password)
        return bcrypt.compareSync(id, hash)
    return false;
}