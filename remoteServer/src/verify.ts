import bcrypt from 'bcrypt'

export const createAuth = (val1: string, val2: string): string =>{
    val1 = bcrypt.hashSync(val1, 10);
    val2 = bcrypt.hashSync(val2, 10);

    return val1+val2+val1.length.toString();
}

export const verify = (actual: string, val: string): boolean =>{
    let len = Number(val.slice(val.length-2, val.length))
    if(Number.isNaN(len)) return false;
    
    return bcrypt.compareSync(actual, val.slice(0, len));
}