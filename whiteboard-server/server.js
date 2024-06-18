const express = require('express');
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors")
app.use(cors())
const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:"http://localhost:4200"
    }
})


io.on("connection",(socket)=>{
    console.log(`User Connected ${socket.id}`)
    socket.on('message',(data)=>{
        socket.broadcast.emit('message',data)
    })
})

server.listen(8800,()=>{
    console.log("the server is running on port 8800")
})