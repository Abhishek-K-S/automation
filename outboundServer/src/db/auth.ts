import Database from 'better-sqlite3'

type DBInsert = {name: string, support: string, token: string}

class Auth{
    private db: Database.Database
    private authDBName = "AUTH"

    constructor(){
        this.db = new Database('auth.db', {verbose: (message, ...args)=> console.log("DATABASE: ", message, JSON.stringify(args))})
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS AUTH (
              name varchar(20),
              support varchar(32),
              token TEXT
            )
          `;
        const createTable = this.db.prepare(createTableSQL);
        createTable.run();

        const defuser = process.env.ADMIN || 'admin'

        if(! this.getToken(defuser)){
            this.insert({name: defuser, support: process.env.SECRET || 'admin', token: 'null' });
        }
    }

    insert(entry: DBInsert):void{
        const iStatement = this.db.prepare(`INSERT INTO ${this.authDBName} (name, support, token) values (@name, @support, 'null')`);
        this.db.transaction((e: DBInsert)=> iStatement.run(e))(entry);
    }

    private getStatement(req: string, item: string){
        const gStatement = this.db.prepare<string>(`SELECT ${req} FROM ${this.authDBName} WHERE name = ?`);
        let result = gStatement.get(item)
        console.log('statement getsupport got ', result);
        if(result) return result;
        else return null;
    }

    isAuth(name:string, support: string){
        let isValid = support === this.getStatement('support', name);
        if(!isValid) throw Error('not valid credentials');
        return isValid;
    }

    getToken(name:string){
        return this.getStatement('token', name)
    }

    setToken(name: string, token:string){
        let prep = this.db.prepare(`
        UPDATE ${this.authDBName}
        SET token = ?
        WHERE name = ?
      `)
      prep.run(token, name);
    }
}

export default new Auth;