var app = angular.module('random', ['ngAnimate', 'ngMaterial']);
app.controller('AppController', ['$scope', function($scope) {
   $scope.loggedIn = false;
   $scope.username = '';
   $scope.newMessages = 0;
   $scope.loginRequest = function() {
      if ($scope.username === '' || $scope.username === null || $scope.username.length > 10 || $scope.username === undefined) {
         Snarl.addNotification({
            title: 'Please enter a valid username.'
         });
         $scope.username = '';
      } else if (arrayContains(clientList, $scope.username)) {
         Snarl.addNotification({
            title: 'Username already exists, please choose another one.'
         });
         $scope.username = '';
      } else if (socket.connected === false) {
         Snarl.addNotification({
            title: 'Sorry, could not connect to server.',
            text: 'Please try again later.'
         });
         $scope.username = '';
      } else {
         socket.emit('user request', $scope.username);
         $scope.loggedIn = true;
         name = $scope.username;
         $('#scroll').css({ width: (window.innerWidth - 250) });
      }
   };

   $scope.logOut = function() {
      socket.emit('logout', name);
      name = '';
      $scope.loggedIn = false;
      $scope.username = '';
      setTimeout(function() {
         $('#messages').text('');
      }, 20);
      $('#loginForm')[0].reset();
      $('#loginButton').text('Join');
   };
}]);
