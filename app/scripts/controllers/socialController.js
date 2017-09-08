/**
 * Project : Casino-Micky-Rosa
 * Package :
 * @author Alexandre CAZALA <alexandre.cazala@gmail.com>
 * @date 01/09/2017
 */
app.controller('SocialController', ['$scope', 'socialLoginService', function ($scope, socialLoginService) {
  $scope.isConnected = false;

  setTimeout(function() {
    socialLoginService.getLoginStatus().then(function(resp) {
      console.log(resp);
      console.log("yo");
      $scope.isConnected = resp.status === 'connected';
    })
  }, 1000)


}]);
