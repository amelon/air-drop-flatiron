var AirDrop     = require('../air-drop-flatiron')
  , assert      = require('assert')
  , vows        = require('vows')
  , flatiron    = require('flatiron')
  , app         = flatiron.app
  , package     = AirDrop('test').require('assets/a.js', {name: 'a'}).useBrowserRequire(false);


app.use(flatiron.plugins.http);
app.use(AirDrop);
package.source(function(err, data) {
  console.log(data);
})