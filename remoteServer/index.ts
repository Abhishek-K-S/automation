import dotenv from 'dotenv';
dotenv.config();

import { Server as socketIOServer, } from 'socket.io';
import http from 'http'
import { RemoteData, ServerLimit, socketEvents} from './src/shared/constants';
import { socketReqestLimiter } from './src/middleware/socketRequestLimit';
import * as db from './src/database/serverdb'

//dest: socketID

const httpServer = http.createServer()

httpServer.addListener('request',(req, res)=>{
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Server is running')
    res.end();
})


const port = process.env.PORT;

///Socket connections only
const io = new socketIOServer(httpServer, {cors: {origin: '*'}})

io.on('connection', (socket)=>{
    socket.use(socketReqestLimiter(1200))
    
    console.log('user connected, ', socket.id)

    ///server user logic
    socket.on(socketEvents.relayMessageToServer, (skt: RemoteData) =>{
        console.log('REMOTE: ',socket.id,' -----> SERVER : ', JSON.stringify(skt));
        if(!skt.domain) return;
        let sktId = db.getSocketIdFor(skt.domain)
        socket.join(skt.domain)
        delete skt.domain
        if(sktId){
            socket.to(sktId).emit(socketEvents.relayMessageToServer, {...skt, senderId: socket.id})
        }
    })
    
    
    ///server outbound logic
    socket.on(socketEvents.register, (skt: RemoteData)=>{
        if(skt.domain && db.serverListSize() <= ServerLimit){
            socket.emit(socketEvents.registerSuccess, db.saveDomainName(skt.domain, socket.id));
        }
    })

    socket.on(socketEvents.relayMessageToUser, (skt: RemoteData) =>{
        console.log('REMOTE: ',' SERVER  -----> : ',socket.id, JSON.stringify(skt));
        let to = String(skt.senderId ? skt.senderId: skt.domain);
        console.log("Sending message to ",to)
        skt.senderId && delete skt.senderId
        if(to) socket.to(to).emit(socketEvents.relayMessageToUser, skt)
    })


    socket.on('disconnect', (reason)=>{
        db.removeParticipant(socket.id);
        console.log('user disconnected, ', socket.id)
    })

})

httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
