/**
 * Project : Casino-Micky-Rosa
 * Package :
 * @author Alexandre CAZALA <alexandre.cazala@gmail.com>
 * @date 06/09/2017
 */
app.factory('socket', function ($rootScope) {
  var dataStream = $websocket('ws://192.168.43.251:8000/');
   dataStream.onMessage(function (message) {
   console.log(message);
   });
  return {
    on: function (eventName, callback) {
      dataStream.onMessage(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
