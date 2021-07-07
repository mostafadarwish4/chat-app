const users=[]

const addUser=({id,userName,room})=>{
    //clean data
    userName=userName.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate data
    if(!userName||!room){
        return {error:'userName and must be provided'}
    }
    //
    const existingUser=users.find(user=>user.room===room&&user.userName===userName)
    if(existingUser){
        return {error:'userName is already exist'}
    }
    users.push({id,userName,room})
    const user={userName,room}
    return {user}
}

const removeUser=(id)=>{
    const index=users.findIndex(user=>user.id===id)
    if(index ===-1){
        return {error:'this user is not exist'}
    }
    const user=users.splice(index,1)[0]
    return user
}

//getUser
const getUser=(id)=>{
    const index=users.findIndex(user=>user.id===id)
    if(index==-1){
        return undefined
    }
    return users[index]
}

//get users in a given room
const getUsersInRoom=(room)=>{
    room = room.trim().toLowerCase()
    return users.filter(user=>user.room===room)
}

module.exports={
    addUser,
    removeUser,
    getUsersInRoom,
    getUser
}