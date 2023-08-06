import dotenv from 'dotenv';
import { Server as socketIOServer} from 'socket.io';
import http from 'http'
import { ServerLimit, socketEvents, WithAuth, WithoutAuth } from './src/shared/constants';
// import cors, {CorsOptions} from 'cors'
import { createAuth, verify } from './src/verify';

// const corsOptions: CorsOptions = {
//     origin: 'http://localhost:5500/index.html', // Replace this with the allowed origin(s)
//     credentials: true,
//     optionsSuccessStatus: 200
// };

//dest: socketID
let regServers:{[key: string]:string} = {}
  

const httpServer = http.createServer()

// httpServer.addListener('request', cors(corsOptions))
httpServer.addListener('request',(req, res)=>{
    
    let splitArr = req.url?.split('/')
    let index = splitArr?.indexOf('refreshToken');
    let text = splitArr && index && index > -1 && splitArr[index+1]
    let support = splitArr && index && index > -1 && splitArr[index+2]
    if(text){
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({data: createAuth(text, support?support: text)}))
    }
    else{
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('Server is running')
    }
    res.end();
})

// httpServer.on('request', cors(corsOptions));
dotenv.config();

const port = process.env.PORT;


///Scoket connectinos only
const io = new socketIOServer(httpServer, {cors: {origin: '*'}})

io.on('connection', (socket)=>{
    console.log('user connected, ', socket.id)
    socket.on(socketEvents.init, (skt: WithAuth)=>{
        verify(skt.dest, skt.auth) && socket.join(skt.dest);
    })

    ///server user logic
    socket.on(socketEvents.relayMessageToServer, (skt: WithAuth) =>{

        //check for auth
        if(
            skt.auth && 
            skt.dest && 
            regServers[skt.dest] &&
            verify(skt.dest, skt.auth)
            ){
                if(regServers[skt.dest]){
                    socket.to(regServers[skt.dest]).emit(socketEvents.relayMessageToServer, skt)
                }
        }
    })
    
    
    
    ///server outbound logic
    socket.on(socketEvents.register, (skt: WithoutAuth)=>{
        console.log('server registered, server id is ', socket.id, skt.dest)
        if(Object.keys(regServers).length <= ServerLimit){
            regServers[skt.dest] = socket.id
            // socket.join(skt.dest);
        }
    })

    socket.on(socketEvents.relayMessageToUser, (skt: WithoutAuth) =>{
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
