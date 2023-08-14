import dotenv from 'dotenv';
import { Server as socketIOServer, } from 'socket.io';
import {Event as socketEvent} from 'socket.io/dist/socket'
import http from 'http'
import { PropsWithAuth, PropsWithoutAuth, ServerLimit, socketEvents, WithAuth, WithoutAuth } from './src/shared/constants';
import { createAuth, verify } from './src/verify';
import { socketReqestLimiter } from './src/middleware/socketRequestLimit';

//dest: socketID
let regServers:{[key: string]:string} = {}
  

const httpServer = http.createServer()
httpServer.addListener('request',(req, res)=>{
    
    let splitArr = req.url?.split('/')
    let index = splitArr?.indexOf('refreshToken');
    let text = splitArr && index && index > -1 && splitArr[index+1]
    if(text){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({data: createAuth(text)}))
    }
    else{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Server is running')
    }
    res.end();
})

dotenv.config();

const port = process.env.PORT;


///Socket connectinos only
const io = new socketIOServer(httpServer, {cors: {origin: '*'}})

io.on('connection', (socket)=>{
    socket.use(socketReqestLimiter(5000))
    
    console.log('user connected, ', socket.id)
    socket.on(socketEvents.init, (skt: WithAuth)=>{
        if(includesProps(skt, PropsWithAuth) && verify(skt.dest, skt.auth))
            socket.join(skt.dest);
    })

    ///server user logic
    socket.on(socketEvents.relayMessageToServer, (skt: WithAuth) =>{
        console.log(skt.dest, regServers[skt.dest])

        //check for auth
        if(
            includesProps(skt, PropsWithAuth) && 
            regServers[skt.dest] &&
            verify(skt.dest, skt.auth)
            ){
                socket.to(regServers[skt.dest]).emit(socketEvents.relayMessageToServer, skt)
        }
    })
    
    
    
    ///server outbound logic
    socket.on(socketEvents.register, (skt: WithoutAuth)=>{
        if(skt.dest && Object.keys(regServers).length <= ServerLimit){
            regServers[skt.dest] = socket.id
            // socket.join(skt.dest);
        }
    })

    socket.on(socketEvents.relayMessageToUser, (skt: WithoutAuth) =>{
        if(includesProps(skt, PropsWithoutAuth) )
            socket.to(skt.dest).emit(socketEvents.relayMessageToUser, skt)
    })



    socket.on('disconnect', (reason)=>{
        if(Object.values(regServers).includes(socket.id)){
            for(let a in regServers){
                if(regServers[a]== socket.id){
                    delete regServers[a]
                    break;
                }
            }
        }
    })

})

httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

function includesProps(obj: any, props: string[]): boolean{
    if(obj === undefined || obj === null) return false;
    for(let a in props){
        if(obj[a] === undefined) return false;
    }
    return true;
}
