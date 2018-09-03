var socket = io();

function scrollToBottom(){
    var message = jQuery('#messages');
    var newMessage = message.children('li:last-child')
    var clientHeight = message.prop('clientHeight')

    var scrollTop = message.prop('scrollTop')
    var scrollHeight = message.prop('scrollHeight')
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
        message.scrollTop(scrollHeight)
    }
}

socket.on('connect',function(){
    console.log("Connection")
    var params = jQuery.deparam(window.location.search);
    socket.emit('join',params,function(err){
        if(err){
            alert(err)
            window.location.href = '/'
        }
        else{
            console.log("no error")
        }
    })
})

socket.on('disconnect',function(){
    console.log("disconnect")
})

socket.on('updateUserList',function(users){
    var ol = jQuery('<ol></ol>')
    users.forEach(function(user){
        ol.append(jQuery('<li></li>').text(user))
    })
    jQuery('#users').html(ol)
})

socket.on('newMessage',function(message){
    var formattedTime = moment(message.createdAt).format('h:mm a')
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template,{
        text:message.text,
        from:message.from,
        createdAt:formattedTime
    })
    jQuery('#messages').append(html)
    scrollToBottom()

    // console.log('New Message',message)
    // var formattedTime = moment(message.createdAt).format('h:mm a')
    // var li = jQuery('<li></li>')
    // li.text(`${message.from} ${formattedTime}: ${message.text}`)
    // jQuery('#messages').append(li)
})

// socket.emit('createMessage',{
//     from:'Frank',
//     text:"hi"
// },function(data){
//     console.log("got it",data)
// })

jQuery('#message-form').on('submit',function(e){
    e.preventDefault();
    var messageTextbox = jQuery('[name=message]')
    socket.emit('createMessage',{
        text:messageTextbox.val()
    },function() {
        messageTextbox.val('')
    })

})

var loactionButton = jQuery('#send-loaction')
loactionButton.on('click',function(){
    if(!navigator.geolocation){
        return alert("not support")
    }
    navigator.geolocation.getCurrentPosition(function(position){
        console.log(position)
    },function(){
        alert("Unalbe")
    })
})