/**
 * Project : Casino-Micky-Rosa
 * Package :
 * @author Alexandre CAZALA <alexandre.cazala@gmail.com>
 * @date 06/09/2017
 */

app.factory("GameData", function($websocket){
  var dataStream = $websocket('ws://192.168.43.251:8000/');

  var hands = {};
  var bankHand = {};
  var delays = {
    bettingDelay: 15,
    actionsDelay: 60
  };
  var gameState = 0;
  var actions = {
    'newRound': onNewRound,
    'bet': onBet,
    'deal': onDeal,
    'hit': onHit,
    'double': onDouble,
    'split': onSplit,
    'stand': onStand,
    'gameOver': onGameOver
  };
  dataStream.onMessage(function(message) {
    if (Object.keys(actions).contains(message.data.event)) {
      actions[message.data.event](message.data);
    } else {
      console.error("WS: COMMAND NOT FOUND");
    }
  });

  /**
    {
      "event": "newRound",
      "shuffled": true,
      "betting_delay": 15,
      "actions_delay": 60
    }
   */
  function onNewRound(message) {
    console.log("WS:onNewRound");
    delays.bettingDelay = message.betting_delay;
    delays.actionsDelay = message.actions_delay;
    if (message.shuffled) {
      $rootScope.$emit('deck:shuffled', true);
    }
    gameState = 1
  }

  /**
    {
      "success": true,
      "event": "bet",
      "player": {
        "id": "454651651651",
        "name": "Alexandre Cazala"
      },
      "amount": 153,
    }
   */
  function onBet(message) {
    console.log("WS:onBet");
    hands[message.player.id] = {
      betAmount: message.amount,
      hands: [],
      name: message.player.name
    }
  }

  /**
    {
      "event": "deal",
      "players": {
        "454651651651": {
          "player": {
            "id": "454651651651",
            "name": "Alexandre Cazala",
            "score": 5000
          },
          "hand": {
            "handId": 152651,
            "values": [20],
            "cards": ["K", "J"]
          }
        },
        "156516554": {
          "player": {
            "id": "156516554",
            "name": "Lisa Joanno",
            "score": 5000
          },
          "hand": {
            "handId": 515657,
            "values": [3, 13],
            "cards": ["A", "2"]
          }
        }
      },
      "bankHand": {
        "values": [1, 11],
        "cards": ["A"]
      }
    }

   */
  function onDeal(message) {
    console.log("WS:onDeal");
    bankHand = message.bankHand;
    keys = Object.keys(message.players);
    keys.forEach(function(key) {
      var newHand = messages.players[key].hand;
      newHand.stop = false;
      hands[key].hands.push(newHand);
    });
  }

  /**

   {
       "event": "hit",
       "player": {
           "id": "156516554",
           "name": "Lisa Joanno",
           "score": 5000
       },
       "hand": {
           "handId": 515657,
           "values": [6, 16],
           "cards": ["A", "2", "3"]
       },
       "card": "3"
   }
   */
  function onHit(message) {
    console.log("WS:onHit");
    hands[message.player.id].hands[getActiveHandIndex(message.player.id)] = message.hand;
  }

  /**
   {
       "event": "double",
       "player": {
           "id": "156516554",
           "name": "Lisa Joanno",
           "score": 5000
       },
       "hand": {
           "handId": 515657,
           "values": [6, 16],
           "cards": ["A", "2", "3"]
       },
       "card": "3"
   }
   */
  function onDouble(message) {
    console.log("WS:onDouble");
    hands[message.player.id].hands[getActiveHandIndex(message.player.id)] = message.hand;
    hands[message.player.id].hands[getActiveHandIndex(message.player.id)].stop = true;
  }

  /**

   {
       "event": "split",
       "player": {
           "id": "454651651651",
           "name": "Alexandre Cazala",
           "score": 5000
       },
       "hand": {
           "handId": 152651,
           "values": [10],
           "cards": ["K"]
       },
       "new_hand": {
           "handId": 884561,
           "values": [10],
           "cards": ["J"]
       }
   }
   */
  function onSplit(message) {
    var oldHand = message.hand;
    var newHand = message.newHand;
    newHand.stop = false;
    hands[message.player.id].hands.push(newHand);
    oldHand.stop = true;
    hands[message.player.id].hands[getActiveHandIndex(message.player.id)] = oldHand;
  }


  /**
    {
      "event": "stand",
      "player": {
        "id": "156516554",
        "name": "Lisa Joanno",
        "score": 5000
      },
      "hand": {
        "handId": 515657,
        "values": [6, 16],
        "cards": ["A", "2", "3"]
      }
    }
   */
  function onStand(message) {
    hands[message.player.id].hands[getActiveHandIndex(message.player.id)].stop = true;
  }

  /**

   {
       "event": "gameOver",
       "bankHand": {
           "values": [8, 18],
           "cards": ["A", "5", "2"]
       },
       "results": [
           {
               "result": "loss",
               "finalBet": "153",
               "player": {
                   "id": "156516554",
                   "name": "Lisa Joanno",
                   "score": 5153
               },
               "hand": {
                   "handId": 515657,
                   "values": [6, 16],
                   "cards": ["A", "2", "3"]
               }
           },
           {
               "result": "win",
               "finalBet": "153",
               "player": {
                   "id": "454651651651",
                   "name": "Alexandre Cazala",
                   "score": 5153,
               },
               "hand": {
                   "handId": 152651,
                   "values": [19],
                   "cards": ["K", "9"]
               },
           },
           {
               "result": "tie",
               "finalBet": "153",
               "player": {
                   "id": "454651651651",
                   "name": "Alexandre Cazala",
                   "score": 5153
               },
               "hand": {
                   "handId": 884561,
                   "values": [18],
                   "cards": ["K", "8"]
               },
           }
       ]
   }
   */
  function onGameOver(message) {
    bankHand = message.bankHand;
    // TODO;
  }

  function getActiveHandIndex(playerId) {
    for (var i = 0 ; i < hands[playerId].hands.length ; ++i) {
      if (!hands[playerId].hands[i].stop) {
        return i;
      }
    }
    return -1;
  }

  return{
    hands: hands,
    bandHand: bankHand,
    delays: delays,
    gameState: gameState,

    emitHit: function(message) {
      message.event = "hit";
    },
    emitBet: function(message) {
      message.event = "bet";
    },
    emitDouble: function(message) {
      message.event = "double";
    },
    emitStand: function(message) {
      message.event = "stand";
    }
  };
});
