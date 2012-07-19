var flatiron  = require('flatiron')
  , app       = flatiron.app
  , ecstatic  = require('ecstatic')
  , AirDrop   = require('../air-drop-flatiron')
  , package   = AirDrop('/my-pack.js')
                  .include('public/js/a.js')
                  .include('public/js/b.js')
                  // .package()
                  // .minimize().cache();


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
