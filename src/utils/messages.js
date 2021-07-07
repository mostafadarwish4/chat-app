const createMessage=message=>{
    return{
        userName:message.userName,
        text:message.text,
        createdAt:new Date().getTime()
    }
}
const createLocationMessage=message=>{
    return{
        userName:message.userName,
        url:message.location,
        createdAt:new Date().getTime()
    }
}
module.exports={
    createMessage,
    createLocationMessage
}