Trello.authorize({
  type: 'popup',
  name: 'BugBash',
  scope: {
    read: 'true',
    write: 'true' },
  expiration: 'never',
  success: function() { console.log('authenticated') },
  error: function() { console.log(':( auth failure') }
});
