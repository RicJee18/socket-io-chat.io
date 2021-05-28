
$(function () {
    window.EmojiPicker.init()
    let private;
    let privateName = "";
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
        if ($('.message').val()) {



            if (private) {
                socket.emit("private", { message: $('.message').val(), to: privateName, sender: currentUser });
                // 
            } else {
                socket.emit('chat message', {
                    message: $('.message').val(),
                    sender: currentUser
                });
                $('.direct-chat-messages').append(senderMessage($('.message').val()))
            }


            $(".direct-chat-messages").animate({
                scrollTop: $(".direct-chat-messages")[0].scrollHeight
            }, 1000);
            $('.message').val('');
            return false;
        }


    });


    socket.on(`private-ni`,(data)=>{
        console.log(data.sender+": "+data.message)
        if(data.sender==currentUser){
            $('.private-chat').append(senderMessage(data.message))
        }else{
            $('.private-chat').append(recieverMessagePrivate(data))
        }
       
    })

    socket.on("private", function (data) {
        $('.private-chat').append(recieverMessagePrivate(data))
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

    $('.message').keyup(function () {
        socket.emit('typing', currentUser);
    })

    $('.message').focusout(() => {
        socket.emit('out typing');
    })

    socket.on('chat message', function (msg) {
        $('.message').val('');
        $('.direct-chat-messages').append(recieverMessage(msg))
        $(".message-container").animate({
            scrollTop: $(".message-container")[0].scrollHeight
        }, 1000);
    });


    //show when typing 
    socket.on('typing', function (typingUser) {

        $('#typing').removeClass('d-none').find('p').text(`${typingUser} is typing....`);

    });

    //stop typing
    socket.on('out typing', function () {
        $('#typing').addClass('d-none').find('p').text('')
    });

    //user disconnected
    socket.on("user disconnected", function (userName, count) {
        if (userName) {
            let username = `.${userName.replace(' ', '')}-contact-item`
            console.log(username);
            $(username).remove()
            $('.direct-chat-messages').append(userLeft(userName, count))
        }

    });

    //back to the group chat if it is click
    $('#group-chat').on('click', () => {
        $('.direct-chat-messages').removeClass('d-none').addClass('d-block')
        $('.private-chat').removeClass('d-block').addClass('d-none')
    })

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
            <i class="fa fa-spinner fa-pulse fa-3x fa-fw spin"></i>
        </div>`;
    }

    function senderMessage(message) {
        return `<div class="direct-chat-msg right">
                    <div class="direct-chat-infos clearfix">
                        <span class="direct-chat-name float-right">${currentUser}</span>
                        <span class="direct-chat-timestamp float-left">21 May 4:10 pm</span>
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

    function recieverMessagePrivate(data) {
        return `<div class="direct-chat-msg">
            <div class="direct-chat-infos clearfix">
                <span class="direct-chat-name float-left">${data.sender}</span>
                <span class="direct-chat-timestamp float-right">23 Jan 5:37 pm</span>
            </div>
            <!-- /.direct-chat-infos -->
            <img class="direct-chat-img" src="https://www.pngarts.com/files/6/User-Avatar-in-Suit-PNG.png" alt="message user image">
            <!-- /.direct-chat-img -->
            <div class="direct-chat-text">
                ${data.message}
            </div>
            <!-- /.direct-chat-text -->
        </div>`;
    }

    var today = new Date();

    function chatList(user) {
        console.log(user);
        return `<li  class="${user.replace(' ', '')}-contact-item contact-item bot"  data-toggle="tooltip" title="Contacts" data-widget="chat-pane-toggle">
                    
                        <img class="contacts-list-img" src="https://www.pngarts.com/files/6/User-Avatar-in-Suit-PNG.png">

                        <div class="contacts-list-info">

                            <span class="contacts-list-name ">
                                 <span class="username"> ${user} </span>
                                 <small class="contacts-list-date float-right">${today.toDateString()}</small><br>
                                 <small class="contacts-list-date float-right">${today.toLocaleTimeString()}</small>
                            </span>

                            <span class="contacts-list-msg">online</span>

                        </div>
                        <!-- /.contacts-list-info -->
                   
                </li>
            `
    }


    //this is for private message
    $(document).on('click', '.bot', function () {
        private = true;
       
        privateName = $(this).children('.contacts-list-info').children().children('.username').html().trim();
        $('.reciever').html(privateName)
        $('.direct-chat-messages').removeClass('d-block').addClass('d-none')
        $('.private-chat').removeClass('d-none').addClass('d-block')
    })


});