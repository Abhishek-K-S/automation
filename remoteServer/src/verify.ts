import bcrypt from 'bcrypt'

export const createAuth = (val1: string): string =>{
    return bcrypt.hashSync(val1, bcrypt.genSaltSync());
}

export const verify = (actual: string, val: string): boolean =>{
    if(actual && val)
        return bcrypt.compareSync(actual, val);
    return false;
}