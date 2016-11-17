angular.module('myApp').controller('BugBashCtrl', ['$scope', function($scope) {
  $scope.users = {
    "522f3933ba846d63530096ac": {name: "James", url: "https://trello-avatars.s3.amazonaws.com/77decac41785d0b8dc150c40e0f1ec78/original.png"},
    "551afecc51f29719e4bc5b3a": {name: "Daniel", url: 'https://trello-avatars.s3.amazonaws.com/e9215d214a995eb77f58150cf445882f/original.png'},
    "522f38b0fe1753a75000609a": {name: "Mat", url: 'https://trello-avatars.s3.amazonaws.com/d43b97bee5f9337c6d91561ada60a63f/original.png'},
    "5245c0795f1582e47c003dff": {name: "Andrew", url: 'https://trello-avatars.s3.amazonaws.com/0c9bd97b7126ed64c85ab0f58e2c1c55/original.png'},
    "4fc78a59a885233f4b349bd9": {name: "Doug", url: 'https://trello-avatars.s3.amazonaws.com/2da34d23b5f1ac1a20e2a01157bfa9fe/original.png'},
    "56afbc1ee82558735c3214cd": {name: "Akshay", url: 'https://trello-avatars.s3.amazonaws.com/ea5261293728620f2f89d0d5a401d755/original.png'},
    "575eefb2ce7af86110252085": {name: "Marvin", url: 'https://trello-avatars.s3.amazonaws.com/814c52ae4913986200e8ad04f7a908df/original.png'},
    "5755d2f02e3b54c9d35c4ab0": {name: "Aster", url: "https://trello-avatars.s3.amazonaws.com/4e4748f35def38a1237422250dbb3846/original.png"},
    "522f7f0599f30bf5540009ce": {name: "Chrissy", url: "https://trello-avatars.s3.amazonaws.com/ccb513f54546e0873cefa942e5455074/original.png"},
    "52b3261a8c472d1e14012356": {name: "Edwin", url: "https://trello-avatars.s3.amazonaws.com/40d82636ca705937c5aa14b0e83cde91/original.png"},
    "52b6e87c0f9358f26700f8d5": {name: "Jenn", url: "https://trello-avatars.s3.amazonaws.com/419f941eb7aedc89e2eebb6b4012b3e2/original.png"},
    "4f0b60c9d1e39cca3f1cbc31": {name: "John", url: "https://trello-avatars.s3.amazonaws.com/1c41f3f361f7d5329873af766a7a832f/original.png"},
    "553fb289b85dad4514510be2": {name: "Lisa", url: "https://trello-avatars.s3.amazonaws.com/ca15b59b48f6d909c5cf74013791eae3/original.png"},
    "5351cdd5125d40193550994b": {name: "Nate", url: "https://trello-avatars.s3.amazonaws.com/788e938a19e46073cb5aee64fbfc6a2e/original.png"},
    "523755d0882aec980e0004e4": {name: "Todd", url: "https://trello-avatars.s3.amazonaws.com/a8556dbcad829c78639af1ae5ebaa316/original.png"},
    "4e6fdf2717dbd1ac3502274f": {name: "Tom", url: "https://trello-avatars.s3.amazonaws.com/4f363612cce5daceb1106d6d985c19b7/original.png"}
  };

  var standings = {};
  var totals = {ready: 0, in_progress: 0, done: 0};

  var add_cards_to_standings = function(cards, state) {
    _.each(cards, function(card) {
      var points = _.sum(_.map(card.labels, function(label) { return parseInt(label.name) })) || 1;
      totals[state] += points;

      _.each(card.idMembers, function(user_id) {
        if (!standings[user_id]) standings[user_id] = [];

        standings[user_id].push({
          title: card.name,
          points: points / card.idMembers.length,
          state: state
        });
      });
    });
  };

  // - refresh automatically
  var refresh_standings = function() {
    Trello.get("/lists/581f730eea0276457bd0a260/cards", function(ready_cards) {
      _.each(ready_cards, function(card) {
        var points = _.sum(_.map(card.labels, function(label) { return parseInt(label.name) })) || 1;

        totals.ready += points;
      });

      Trello.get("/lists/581f7313077d5499a48ae766/cards", function(in_progress_cards) {
        add_cards_to_standings(in_progress_cards, "in_progress");

        Trello.get("/lists/581f7314f45f91928c8f18d2/cards", function(done_cards) {
          add_cards_to_standings(done_cards, "done");
          var processed_standings = [];
          var max_total = -1;
          _.each(standings, function(cards, user_id) {
            cards_by_state = _.partition(cards, function(c) { return c.state == 'done' });
            var total = _.sum(_.map(cards, function(c) { return c.points }));
            var done = _.sum(_.map(cards_by_state[0], function(c) { return c.points }));

            max_total = Math.max(total, max_total);

            processed_standings.push({
              user_id: user_id,
              cards: cards_by_state[0].concat(cards_by_state[1]),
              done_total: done,
              total: total,
              percent_done: (done / total) * 100
            });
          });

          _.each(processed_standings, function(obj) {
            obj.percent = (obj.total / max_total) * 100;
          });

          $scope.standings = processed_standings;
          $scope.totals = totals;
          $scope.totals.percent_done = (totals.done / (totals.ready + totals.done + totals.in_progress)) * 100;
          $scope.totals.percent_in_progress = (totals.in_progress / (totals.ready + totals.done + totals.in_progress)) * 100;
          $scope.totals.percent_remaining = (totals.ready / (totals.ready + totals.done + totals.in_progress)) * 100;
          standings = {};
          totals = {};
          $scope.$apply();
        });
      });
    });
  };

  if (Trello.authorized()) {
    refresh_standings();
    // setInterval(refresh_standings, 5000);
  }
}]);

