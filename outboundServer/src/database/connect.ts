import mongoose from 'mongoose'

//mongo db connection usign mongoose
const connect = () =>{
    mongoose.connect(process.env.MONGO_URL + '/'+ process.env.DB_NAME, {directConnection: true, serverSelectionTimeoutMS: 3000, appName: 'micropump'}).then( (db:any) =>{
        console.log("connection established")
    }).catch((err:any) =>{
        console.log("error occured",err)
    })
}

export default connect;