angular.module('myApp').controller('BugBashCtrl', ['$scope', function($scope) {
  $scope.users = {
    "522f3933ba846d63530096ac": {name: "James", url: "https://trello-avatars.s3.amazonaws.com/77decac41785d0b8dc150c40e0f1ec78/original.png"},
    "551afecc51f29719e4bc5b3a": {name: "Daniel", url: 'https://trello-avatars.s3.amazonaws.com/e9215d214a995eb77f58150cf445882f/original.png'},
    "522f38b0fe1753a75000609a": {name: "Mat", url: ''},
    "5245c0795f1582e47c003dff": {name: "Andrew", url: ''},
    "4fc78a59a885233f4b349bd9": {name: "Doug", url: ''},
    "56afbc1ee82558735c3214cd": {name: "Akshay", url: ''},
    "575eefb2ce7af86110252085": {name: "Marvin", url: ''}
  };

  var standings = {};

  var add_cards_to_standings = function(cards, state) {
    _.each(cards, function(card) {
      var points = _.sum(_.map(card.labels, function(label) { return parseInt(label.name) }));

      _.each(card.idMembers, function(user_id) {
        if (!standings[user_id]) standings[user_id] = [];

        standings[user_id].push({
          title: card.name,
          points: (points / card.idMembers.length) || 1,
          state: state
        });
      });
    });
  };

  // - auth button so that you don't get a popup warning
  // - style the standings better, include CSS transitions when positions change
  // - refresh automatically (and make sure we don't break rate limits)
  var refresh_standings = function() {

    Trello.get("/lists/547bad436ce0b52beae47353/cards", function(in_progress_cards) {
      add_cards_to_standings(in_progress_cards, "in_progress");

      Trello.get("/lists/5603299f53eb86e80e713fb1/cards", function(done_cards) {
        add_cards_to_standings(done_cards, "done");
        var processed_standings = [];
        _.each(standings, function(cards, user_id) {
          cards_by_state = _.partition(cards, function(c) { return c.state == 'done' });
          processed_standings.push({user_id: user_id, cards: cards_by_state[0].concat(cards_by_state[1]), done_total: _.sum(_.map(cards_by_state[0], function(c) { return c.points })), total: _.sum(_.map(cards, function(c) { return c.points }))});
        });
        $scope.standings = processed_standings;
        standings = {};
        $scope.$apply();
      });
    });
  };


  refresh_standings();
  // setInterval(refresh_standings, 5000);
}]);

