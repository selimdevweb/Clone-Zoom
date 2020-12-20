//Initialisation de socket coté client
const socket = io('/')
/* socket.emit('join-room', ROOM_ID, 10) */

//Création de la vidéo 
const videoGrid = document.querySelector('.video-grid')
// utilisation de peer pour un identifiant pour chaque utilisateur
const myPeer = new Peer(undefined, {
    host:'/',
    port:'3001',
})
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}

//connecter la video et initialisation par promesse
navigator.mediaDevices.getUserMedia({
video: true,
audio: true 
}).then(stream => {
addVideoStream(myVideo, stream)

myPeer.on('call', call =>{
call.answer(stream)
const  video = document.createElement('video')
call.on('stream' , userVideoStream => {
    addVideoStream(video, userVideoStream)
})
})

//écoute d'une événement
socket.on('user-connected' , userId =>{
    connecToNewUser(userId, stream)
})

})

socket.on('user-disconnected', userId =>{
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id)
})



//connecter un autre utilisateur
function connecToNewUser(userId, stream ) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    
    call.on('close', ()=>{
        video.remove()
    })
    peers[userId] = call
}

//la fonction ajouter video
function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () =>{
        video.play()
    })
    videoGrid.append(video)
}

