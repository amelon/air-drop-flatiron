var flatiron  = require('flatiron')
  , app       = flatiron.app
  , AirDrop   = require('../air-drop-flatiron')
  , ecstatic  = require('ecstatic')
  , package   = AirDrop('my-pack').require('public/js/a.js', {name: 'a'})
                                  .require('public/js/b.js', {name: 'b'})
                                  // .package().minimize().cache();


app.use(flatiron.plugins.http, {
  before: [
    ecstatic(__dirname + '/public')
  ]
});

app.use(AirDrop);


app.init(function () {  
  app.start(3000);
  console.log({"starting": "on", "www": "http://localhost:3000"}, "info");
});
