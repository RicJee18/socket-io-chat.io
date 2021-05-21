
$(function () {

            
    var socket = io();
    var currentUser = ""
    const newUserConnected = (user) => {
        currentUser = user || `User${Math.floor(Math.random() * 1000000)}`;
        socket.emit("new user", currentUser);
    };

    socket.on("new user", function (users, user) {
        $('.contacts-list').html('')

        users.map((user) => {
            if (currentUser != user) $('.contacts-list').append(chatList(user))

        })

        $('.direct-chat-messages').append(newUserJoin(user, users.length))

    });

    $('#messageForm').submit(function (e) {
        e.preventDefault();
        if ($('#message').val()) {
            socket.emit('chat message', {
                message: $('#message').val(),
                sender: currentUser
            });
            $('.direct-chat-messages').append(senderMessage($('#message').val()))
            $(".message-container").scrollTop($(".message-container")[0].scrollHeight);
            $('#message').val('');
            return false;
        }

    });

    $('#login').submit(async function (e) {
        e.preventDefault();
        $('#loginDiv').append(loading())
        setTimeout(() => {
            $('#loginDiv').addClass('d-none');
            currentUser = $('#username').val()
            newUserConnected(currentUser);
            $('.direct-chat').removeClass('d-none');
        }, 3000)
    });

    $('#message').keyup(function () {
        socket.emit('typing', currentUser);
    })

    $('#message').focusout(() => {
        socket.emit('out typing');
    })

    socket.on('chat message', function (msg) {
        $('#message').val('');
        $('.direct-chat-messages').append(recieverMessage(msg))
    });

    socket.on('typing', function (typingUser) {

        $('#typing').removeClass('d-none').find('p').text(`${typingUser} is typing....`);

    });

    socket.on('out typing', function () {
        $('#typing').addClass('d-none').find('p').text('')
    });

    socket.on("user disconnected", function (userName, count) {
        if (userName) {
            let username = `.${userName.replace(' ', '')}-contact-item`
            console.log(username);
            $(username).remove()
            $('.direct-chat-messages').append(userLeft(userName, count))
        }

    });
    
    //  this is for emoji emoji

    // $('#hello').on('click',function(){
    //     console.log('hello');
    // })

    function newUserJoin(user, count) {
        let info = user == currentUser ? 'You' : user 
        return `<div class="container text-center rounded">
                <strong><p> ${info} joined the group</p></strong>
                <p><em>We are now ${count} in the group chat.</em><p>
            </div>`
    }

    function userLeft(user, count) {
        return `<div class="container text-center  rounded">
            <strong><p> ${user} leave the group!</p></strong>
            <p><em>We are only now ${count} in the group chat.</em><p>
            </div>`
    }

    function loading() {
        return `
        <div class="overlay">
            <i class="fas fa-2x fa-sync-alt fa-spin"></i>
        </div>`;
    }
    
    function senderMessage(message) {
        return `<div class="direct-chat-msg right">
                    <div class="direct-chat-infos clearfix">
                        <span class="direct-chat-name float-right">${currentUser}</span>
                        <span class="direct-chat-timestamp float-left">23 Jan 6:10 pm</span>
                    </div>
                    <!-- /.direct-chat-infos -->
                    <img class="direct-chat-img" src="https://www.pngarts.com/files/6/User-Avatar-in-Suit-PNG.png" alt="message user image">
                    <!-- /.direct-chat-img -->
                    <div class="direct-chat-text">
                        ${message}
                    </div>
                    <!-- /.direct-chat-text -->
                </div>`;
    }


    function recieverMessage(message) {
        return `<div class="direct-chat-msg">
            <div class="direct-chat-infos clearfix">
                <span class="direct-chat-name float-left">${message.sender}</span>
                <span class="direct-chat-timestamp float-right">23 Jan 5:37 pm</span>
            </div>
            <!-- /.direct-chat-infos -->
            <img class="direct-chat-img" src="https://www.pngarts.com/files/6/User-Avatar-in-Suit-PNG.png" alt="message user image">
            <!-- /.direct-chat-img -->
            <div class="direct-chat-text">
                ${message.message}
            </div>
            <!-- /.direct-chat-text -->
        </div>`;
    }

    var today = new Date();
    
    function chatList(user) {
        return `<li  class="${user.replace(' ', '')}-contact-item contact-item bot" userni="${user}"  data-toggle="tooltip" title="Contacts" data-widget="chat-pane-toggle">
                    <a href="#"  >
                        <img class="contacts-list-img" src="https://www.pngarts.com/files/6/User-Avatar-in-Suit-PNG.png">

                        <div class="contacts-list-info">

                            <span class="contacts-list-name ">
                                  ${user} 
                                 <small class="contacts-list-date float-right">${today.toDateString()}</small><br>
                                 <small class="contacts-list-date float-right">${today.toLocaleTimeString()}</small>
                            </span>

                            <span class="contacts-list-msg">online</span>

                        </div>
                        <!-- /.contacts-list-info -->
                    </a>
                </li>
            `
    }
    
    //this is for private message
    $('.contacts-list').on('click', '.bot' , () => {
        alert($(this).attr('userni'));       
    })

    
});