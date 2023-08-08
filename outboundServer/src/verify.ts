import bcrypt from 'bcrypt'

export const verifyUser = (hash: string, id: string, password: string): boolean =>{
    let len = Number(hash. slice(hash.length-2, hash.length));
    if(Number.isNaN(len)) return false;
    let flag = bcrypt.compareSync(id, hash.slice(0, len)) && bcrypt.compareSync(password, hash.slice(len+1, hash.length-2));
    return flag;
}