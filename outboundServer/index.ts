import dotenv from 'dotenv';
import http from 'http'
import {io} from 'socket.io-client'
import { ServerLimit, socketEvents, WithAuth, WithoutAuth } from './src/shared/constants';
// import { createAuth, verify } from './src/verify';

const httpServer = http.createServer()

// httpServer.addListener('request', cors(corsOptions))
httpServer.addListener('request',(req, res)=>{
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write('Server is running')
    res.end();
})

dotenv.config();

const port = process.env.PORT;
const serverURL = process.env.SERVER_URL || ''

const socket = io(serverURL)

socket.on('connect', ()=>{
  console.log('server connected to '+ serverURL)
})

socket.on(socketEvents.relayMessageToServer, (skt: WithAuth) =>{

})

function replyToUser(msg: any): void{
  socket.emit(socketEvents.relayMessageToUser, msg )
}



///Scoket connectinos only
// const io = new socketIOServer(httpServer, {cors: {origin: '*'}})  //replace the url with of server adn local network

// io.on('connection', (socket)=>{
//     console.log('user connected, ', socket.id)

//     ///server user logic
//     socket.on(socketEvents.relayMessageToServer, (skt: WithAuth) =>{

//         //check for auth
//         if(
//             skt.auth && 
//             skt.dest && 
//             regServers[skt.dest] &&
//             verify(skt.dest, skt.auth)
//             ){
//                 if(!clientMap[socket.id]){
//                     clientMap[socket.id] = skt.dest;
//                 }
//                 if(regServers[skt.dest]){
//                     socket.to(regServers[skt.dest].socketID).emit(socketEvents.relayMessageToServer, skt)
//                     if(!regServers[skt.dest].clients.includes(socket.id)) regServers[skt.dest].clients.push(socket.id)
//                 }
//         }
//     })
    
    
    
//     ///server outbound logic
//     socket.on(socketEvents.register, (skt: WithoutAuth)=>{
//         console.log('server registered, server id is ', socket.id, skt.dest)
//         if(Object.keys(regServers).length <= ServerLimit){
//             regServers[skt.dest] = {socketID: socket.id, clients: []}
//         }
//     })

//     socket.on(socketEvents.relayMessageToUser, (skt: WithoutAuth) =>{
//         if(regServers[socket.id]?.clients.length){
//             socket.to(regServers[socket.id].clients).emit(socketEvents.relayMessageToUser, skt)
//         }
//     })



//     socket.on('disconnect', (reason)=>{
//         if(Object.values(regServers).map(ele=> ele.socketID).includes(socket.id)){
//             for(let a in regServers){
//                 if(regServers[a].socketID == socket.id){
//                     delete regServers[a]
//                     break;
//                 }
//             }
//         }
//         else if(clientMap[socket.id]){
//             let serverid = clientMap[socket.id] //gives dest
//             delete clientMap[socket.id];
//             let loc: number|undefined = regServers[serverid]?.clients.indexOf(socket.id)
//             if(loc!= undefined && loc>-1){
//                 regServers[serverid].clients.splice(loc, 1)
//             }

//         }
//     })


// })



httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

