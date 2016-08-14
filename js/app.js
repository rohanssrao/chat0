var arrayContains = function(array, obj) {
   for (let index in array) {
      if (array[index] === obj) {
         return true;
      }
   }
   return false;
};

var scrollToMessage = function(scrolled, isOwnSender = false) {

   if (scrolled) {
      $('#chat').animate({
         scrollTop: $('#chat')[0].scrollHeight
      }, {
         duration: 1000,
         queue: false,
         progress: function() {
            if ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) {
               $('#chat').stop(false, true);
            }
         }
      });
   } else if (!isOwnSender) {
      let $scope = angular.element($('body')).scope();
      $scope.$apply(function() {
         $scope.newMessages++;
      });
   }
};

var docUrl = (document.location.href.endsWith('index.html')) ? document.location.href.replace('index.html', '') : document.location.href;
var socket = io.connect(docUrl);
var typing = false;
var timeout;
var clientList;
var sessionid;
var name = '';
var scrollAtBottom;

function imageExists(url, callback) {
   if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(url)) {
      callback(true);
   } else { callback(false); }
}

function isYouTube(url) {
   if (url !== undefined || url !== '') {
      var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
      var match = url.match(regExp);
      if (match && match[2].length === 11) {
         // Do anything for being valid
         // if need to change the url to embed url then use below line
         return 'https://www.youtube.com/embed/' + match[2] + '?autoplay=0';
      } else {
         return 'no';
      }
   } else {
      return 'no';
   }
}

function flashTitle(name) {
   $('title').text('New message from ' + name);
   setTimeout(function() {
      $('title').text('idek');
   }, 1500);
}

var interval = setInterval(function() {

   if (socket.connected === false) {
      console.log('couldn\'t connect, retrying');
      $('#enterMessage').attr('disabled', 'disabled');
      $('#submitMessage').attr('disabled', 'disabled');
      $('#submitMessage').addClass('disabled');
      $('#enterMessage').css('cursor', 'not-allowed');
      $('#submitMessage').css('cursor', 'not-allowed');
   } else {
      $('#enterMessage').removeAttr('disabled');
      $('#submitMessage').removeAttr('disabled');
      $('#submitMessage').removeClass('disabled');
      $('#enterMessage').css('cursor', 'text');
      $('#submitMessage').css('cursor', 'pointer');
      clearInterval(interval);
   }

}, 350);

$(window).resize(function() {
   $('#scroll').css({ width: (window.innerWidth - $('#container').width() - 20) });
});

socket.on('connect', function() {
   sessionid = socket.io.engine.id;
});

socket.on('disconnect', function() {
   let $scope = angular.element($('body')).scope();
   $scope.$apply(function() {
      name = '';
      $scope.loggedIn = false;
      $scope.username = '';
      setTimeout(function() {
         $('#messages').text('');
      }, 20);
      $('#loginForm')[0].reset();
      $('#loginButton').text('Join');
      Snarl.addNotification({
         title: 'Disconnected from server',
         text: 'You were disconnected from the chat server due to a network issue.',
         icon: '<i class="fa fa-spinner" aria-hidden="true"></i>'
      });
   });
});

$('#enterMessage').focus();

$('#chatForm').submit(function() {

   function pad(n) {
      return (n < 10) ? '0' + n : n;
   }

   let time = new Date();
   let hours = time.getHours();
   let minutes = time.getMinutes();
   let seconds = time.getSeconds();
   let amPm = 'am';

   if (hours > 12) {
      hours -= 12;
      amPm = 'pm';
   } else if (hours === 0) {
      hours = 12;
   }

   let todisplay = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + ' ' + amPm;

   if ($('#enterMessage').val() !== '') {
      let url;
      let text = $('#enterMessage').val();
      if (text.startsWith('http://') === false && text.startsWith('https://') === false) {
         url = 'http://' + text;
      } else { url = text; }

      imageExists(url, function(exists) {

         if (exists) {

            scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
            $('#messages').append($('<li class="rightAlign">').html('<img style=\'margin: 10px; max-width: 400px;\' onerror=\'imgError(this);\' src=\'' + url + '\' /> - <span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay));
            var img = $('#messages li:last-child img');

            scrollToMessage(scrollAtBottom, true);

            setTimeout(function() {
               if (img.width() === 0) {
                  socket.emit('chat message', { text: text, name: name, time: todisplay });
                  $('#messages li:last-child').html(text + ' - ' + '<span style="color: rgb(255, 99, 0)">you</span>');
               } else {
                  socket.emit('image message', { url: url, name: name, time: todisplay });
               }
            }, 50);

         } else if (isYouTube(url) !== 'no') {

            socket.emit('youtube message', { url: url, name: name, time: todisplay });
            scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
            $('#messages').append($('<li class="rightAlign">').html('<iframe style=\'margin: 10px;\' src=\'' + isYouTube(url) + '\' /> - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay));

            scrollToMessage(scrollAtBottom, true);

         } else {

            socket.emit('chat message', { text: text, name: name, time: todisplay });
            scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
            $('#messages').append($('<li class="rightAlign">').html(text + ' - ' + '<span style="color: rgb(255, 99, 0)">you</span>, ' + todisplay));

            scrollToMessage(scrollAtBottom, true);
         }

      });

      $('#enterMessage').val('');
      socket.emit('typing', false);
   }
   return false;
});

socket.on('chat message', function(data) {
   flashTitle(data.name);

   scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
   $('#messages').append($('<li>').html(data.text + ' - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time));

   scrollToMessage(scrollAtBottom);

});

socket.on('image message', function(data) {

   flashTitle(data.name);

   scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
   $('#messages').append($('<li>').html('<img style=\'margin: 10px; max-width: 400px;\' src=\'' + data.url + '\' /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time));

   scrollToMessage(scrollAtBottom);

});

socket.on('youtube message', function(data) {

   flashTitle(data.name);

   scrollAtBottom = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
   $('#messages').append($('<li>').html('<iframe style=\'margin: 10px;\' src=\'' + isYouTube(data.url) + '\' /> - <span style="color: rgb(255, 99, 0)">' + data.name + '</span>, ' + data.time));

   scrollToMessage(scrollAtBottom);

});

socket.on('client count', function(numClients) {
   if (numClients === 1) {
      $('header').html(numClients + ' user<br>online:');
   } else { $('header').html(numClients + ' users<br>online:'); }
});

socket.on('client list', function(list) {
   clientList = list;
   var i;
   $('#online').html('');
   if (name !== '') {
      $('#online').append($('<li style="color: rgb(255, 99, 0)">').text('you (' + name + ')'));
   }
   for (i in list) {
      if (list[i] !== name) {
         $('#online').append($('<li>').text(list[i]));
      }
   }
});

socket.on('userDisconnect', function(username) {
   $('#messages').append($('<li style="color: #C0C0C0">').text(username + ' has left'));
});

socket.on('userConnect', function(username) {
   if (username !== name) {
      $('#messages').append($('<li style="color: #919191">').text(username + ' has joined'));
   }
});

socket.on('userTyping', function(user) {
   if (user !== false) {
      if (user !== name) {
         $('#whosTyping').text(user + ' is typing');
      }
   } else {
      $('#whosTyping').text('');
   }
});

$('#enterMessage').keydown(function(e) {
   if (e.which !== 13) {
      typing = true;
      socket.emit('typing', name);
      clearTimeout(timeout);
      timeout = setTimeout(function() {
         typing = false;
         socket.emit('typing', false);
      }, 2000);
   }
   if (e.which === 13) {
      clearTimeout(timeout);
      typing = false;
      socket.emit('typing', false);
   }
});

$('#chat').scroll(function() {
   let scrolled = ($('#chat')[0].scrollHeight - $('#chat').scrollTop() === $('#chat').outerHeight()) ? true : false;
   if (scrolled) {
      let $scope = angular.element($('body')).scope();
      $scope.$apply(function() {
         $scope.newMessages = 0;
      });
   }
});
