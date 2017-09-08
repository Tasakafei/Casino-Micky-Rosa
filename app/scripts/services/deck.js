'use strict';
/*global app*/

app.factory("Deck", function($websocket){

  /*var dataStream = $websocket('ws://192.168.43.251:8000/');
  dataStream.onMessage(function (message) {
    console.log(message);
  });*/

  function containsAce(array){

    //works for modern browsers
    return array.indexOf('ace') !== -1;

  }

  return{
    getRemainingCards: function(){
      return cards.length;
    }
  };
});
