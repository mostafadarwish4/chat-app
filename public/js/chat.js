const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
//options
// Qs libarary that installed or called atchat.html
// location is a global object provided to your font-end code page
const {userName,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

//reach bottom at each render ro messages automatically
const autoScroll=()=>{
    //New message element
    const $newMessage=$messages.lastElementChild
    //height of the new message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    //visible height
    const visibleHeight=$messages.offsetHeight

    //container of messages Height
    const containerHeight=$messages.scrollHeight
    // how far i have scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight
    
    // wnat to sure that i am not at the bottom because if if i was not at the bottom i will not scroll down 
    if(containerHeight-newMessageHeight<=scrollOffset){
        //push to the bottom
        $messages.scrollTop=$messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        userName:message.userName,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})
socket.on('locationMessage',(message)=>{
    const html=Mustache.render(locationTemplate,{
        userName:message.userName,
        url:message.url,
        // moment is library for timeStamp installed in script at index.html
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable form after submitting to prevent send message twice
    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        //enable submit again and clear input
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('This message was delivered!')
    })
})
$sendLocationButton.addEventListener('click',()=>{
    //old browsers don't support geolocation
    if(!navigator.geolocation){
        return alert('Your browser does not support geolocation')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition(({coords:{latitude,longitude}})=>{
        socket.emit('sendLocation',
        `https://google.com/maps?q=${latitude},${longitude}`,()=>{
            console.log('Location has been shared')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})
socket.emit('join',{userName,room},(error)=>{
    if(error){
        alert(error)
        //back to root page
        location.href='/'
    }
})