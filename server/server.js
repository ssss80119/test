const path = require('path')
const publicPath = path.join(__dirname,'../public')
const express = require('express')
const socketIO = require('socket.io')
const http = require('http')
const {generateMessage} = require('./utils/message')
const {isRealString} = require('./utils/validation')
const {Users} = require('./utils/users')
const port = process.env.PORT || 3000

var app = express()
var server = http.createServer(app)
var io = socketIO(server)
var users = new Users();

app.use(express.static(publicPath));
io.on('connection',(socket)=>{
    console.log('new user')

    //socket.emit('newMessage',generateMessage('Admin','Welcome'))
    //socket.broadcast.emit('newMessage',generateMessage('Admin','new user joined'))

    socket.on('join',(params,callback)=>{
        if(!isRealString(params.name) || !isRealString(params.room)){
            return callback("name and room name are required")
        }
        socket.join(params.room)
        users.removeUser(socket.id)
        users.addUser(socket.id,params.name,params.room)

        io.to(params.room).emit('updateUserList',users.getUserList(params.room))
        socket.emit('newMessage',generateMessage('Chat Robot',"Welcome to Yueh's Chatroom"))
        socket.broadcast.to(params.room).emit('newMessage',generateMessage('Chat Robot',`${params.name} has joined`))
        callback()
    })

    socket.on('createMessage',(message,callback)=>{
        console.log('createMessage',message);
        var user = users.getUser(socket.id)
        if(user && isRealString(message.text)){
            io.to(user.room).emit('newMessage',generateMessage(user.name,message.text));
        }
        callback();
        

        // socket.broadcast.emit('newMessage',{
        //     from:message.from,
        //     text:message.text,
        //     createdAt:new Date().getTime()
        // })
    })

    socket.on('disconnect',()=>{
        console.log("user disconnect")
        var user = users.removeUser(socket.id)
        if(user){
            io.to(user.room).emit('updateUserList',users.getUserList(user.room))
            io.to(user.room).emit('newMessage',generateMessage('Chat Robot',`${user.name} has left`))
        }
    })
})

server.listen(port,()=>{
    console.log("Start")
})