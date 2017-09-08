/**
 * Project : Casino-Micky-Rosa
 * Package :
 * @author Alexandre CAZALA <alexandre.cazala@gmail.com>
 * @date 01/09/2017
 */
"use strict";

var socialLogin = angular.module('socialLogin', []);

socialLogin.provider("social", function(){
  var fbKey, fbApiV, googleKey, linkedInKey;
  return {
    setFbKey: function(obj){
      fbKey = obj.appId;
      fbApiV = obj.apiVersion;
      var d = document, fbJs, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
      fbJs = d.createElement('script');
      fbJs.id = id;
      fbJs.async = true;
      fbJs.src = "//connect.facebook.net/en_US/sdk.js";

      fbJs.onload = function() {
        FB.init({
          appId: fbKey,
          status: true,
          cookie: true,
          xfbml: true,
          version: fbApiV
        });
      };

      ref.parentNode.insertBefore(fbJs, ref);
    },
    $get: function(){
      return{
        fbKey: fbKey,
        fbApiV: fbApiV
      }
    }
  }
});

socialLogin.factory("socialLoginService", ['$window', '$rootScope', '$q',
  function($window, $rootScope, $q){
    return {
      logout: function(){
          FB.logout(function(res){
            $rootScope.$broadcast('event:social-sign-out-success', "success");
          });

      },
      getLoginStatus: function() {
        var deferred = $q.defer();
        FB.getLoginStatus(function (response) {
          if (!response || response.error) {
            deferred.reject('Error occured');
          } else {
            deferred.resolve(response);
          }
        });
        return deferred.promise;
      }
    }
  }]);

socialLogin.directive("fbLogin", ['$rootScope', 'social', 'socialLoginService', '$q',
  function($rootScope, social, socialLoginService, $q){
    return {
      restrict: 'EA',
      scope: {},
      replace: true,
      link: function(scope, ele, attr){
        ele.on('click', function(){
          var fetchUserDetails = function(){
            var deferred = $q.defer();
            FB.api('/me?fields=name,email,picture', function(res){
              if(!res || res.error){
                deferred.reject('Error occured while fetching user details.');
              }else{
                deferred.resolve({
                  name: res.name,
                  email: res.email,
                  id: res.id,
                  imageUrl: res.picture.data.url
                });
              }
            });
            return deferred.promise;
          };
          FB.getLoginStatus(function(response) {
            console.log("called");
            if(response.status === "connected") {
              fetchUserDetails().then(function(userDetails){
                userDetails["token"] = response.authResponse.accessToken;
                $rootScope.$broadcast('event:social-sign-in-success', userDetails);
              });
            } else{
              FB.login(function(response) {
                console.log(response);
                if(response.status === "connected"){
                  fetchUserDetails().then(function(userDetails){
                    userDetails["token"] = response.authResponse.accessToken;
                    $rootScope.$broadcast('event:social-sign-in-success', userDetails);
                  });
                }
              }, {scope: 'email', auth_type: 'rerequest'});
            }
          });
        });
      }
    }
  }]);
