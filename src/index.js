const express=require('express')
const path=require('path')
const socketio=require('socket.io')
const http=require('http')
const Filter=require('bad-words')
const app =express()
const server=http.createServer(app)
const io=socketio(server)
const {createMessage,createLocationMessage}=require('./utils/messages')
const { addUser,removeUser,getUser, getUsersInRoom } = require('./utils/users')

const port=process.env.PORT||3000

const PublicDirectory=path.join(__dirname,'../public')
app.use(express.static(PublicDirectory))


server.listen(port,()=>{
    console.log(`Server is up on port ${port}!`)
})


io.on('connection',(socket)=>{
    console.log('New webSocket connection!')

    socket.on('join',(options,callback)=>{
        const {error,user}=addUser({id:socket.id,...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',createMessage({userName:'admin',text:'Welcome!'}))
        socket.to(user.room).emit('message',createMessage({userName:user.userName,text:`${user.userName} has connected`}))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)})
        callback()
    })
    socket.on('sendMessage',(text,callback)=>{
        const filter=new Filter()
        if(filter.isProfane(text)){
            return callback('Profanty is not allowed!')
        }
        const user=getUser(socket.id)
        io.to(user.room).emit('message',createMessage({userName:user.userName,text}))
        //tell client that it recieved the message
        callback()
    })
    socket.on('sendLocation',(location,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',createLocationMessage({userName:user.userName,location}))
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        console.log(user)
        if(user){
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)})
            //use io not socket.brodcast bacause ath this yime the connection be out of broadcast
            io.to(user.room).emit('message',createMessage({userName:'admin',text:`${user.userName} has left!`}))
        }
        
    })
})