var app = angular.module('random', ['ngAnimate', 'ngMaterial']);
app.controller('AppController', ['$scope', function ($scope) {
        $scope.loggedIn = false;
        $scope.username = '';
        $scope.newMessages = 0;
        $scope.chatMessage = '';
        $scope.loginRequest = function () {
            if ($scope.username === '' || $scope.username === null || $scope.username.length > 10 || $scope.username === undefined) {
                Snarl.addNotification({
                    title: 'Please enter a valid username.',
                    icon: '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>'
                });
                $scope.username = '';
            }
            else if (arrayContains(clientList, $scope.username)) {
                Snarl.addNotification({
                    title: 'Username already exists.',
                    text: 'Please choose another one.',
                    icon: '<i class="fa fa-times-circle" aria-hidden="true"></i>'
                });
                $scope.username = '';
            }
            else if (socket.connected === false) {
                Snarl.addNotification({
                    title: 'Sorry, could not connect to server.',
                    text: 'Please try again later.',
                    icon: '<i class="fa fa-spinner" aria-hidden="true"></i>'
                });
                $scope.username = '';
            }
            else {
                socket.emit('user request', $scope.username);
                $scope.loggedIn = true;
                name = $scope.username;
                $('#scroll').css({ width: (window.innerWidth - 250) });
            }
        };
        $scope.logOut = function () {
            socket.emit('logout', name);
            name = '';
            $scope.loggedIn = false;
            $scope.username = '';
            $scope.chatMessage = '';
            setTimeout(function () {
                $('#messages').text('');
            }, 20);
            $('#loginForm')[0].reset();
            $('#loginButton').text('Join');
        };
    }]);
