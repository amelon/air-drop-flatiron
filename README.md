# AirDrop for flatiron> [AirDrop] is a Node.js Connect middleware for compiling, concatenating and minimizing your JS/Coffee source files and delivering them to the browser on-the-fly. > Personally I think this approach is preferable to using build scripts, file watchers, etc.Now it's for [flatiron] too.## InstallInstall with `npm`:```npm install air-drop-flatiron```You can run the specs with `npm` as well:## APISee [AirDrop] repo## [Flatiron] integration```javascriptvar flatiron  = require('flatiron')  , app       = flatiron.app  , AirDrop   = require('air-drop-flatiron')  , ecstatic  = require('ecstatic')  , package   = AirDrop('my-pack').require('js/jquery-1.7.2.js', {name: 'jquery'})                                  .require('js/jquerypp.js', {name: 'jquerypp'})                                  .require('js/can.jquery-1.0.5.js', {name: 'can'})                                  // .package().minimize().cache();    app.use(flatiron.plugins.http, {  before: [    ecstatic(__dirname + '/public')  ]});//app is now AirDrop aware (app.AirDrop('foo-pack').include...)//you can defined AirDrop packages before app.use(flatiron.plugins.http) or afterapp.use(AirDrop);//When a package is created AirDrop set automatically routes to Director for handling this packageAirDrop('second-pack').include('public/js/**/*.js')app.init(function () {    app.start(3000);  console.log({"starting": "on", "www": "http://localhost:3000"}, "info");});```## Current issues### WindowsCurrently, [AirDrop] is not working on windows because of path resolving (nightmare on windows: path `c:/foo/bar` is resolved as `c:\\foo\\bar`) and it makes bad things on Path AirDrop module.Second issue on windows is usage of [glob].glob wants input with forward-slach (accept `/foo/bar` and not `\\foo\\bar`). Still path resolution in AirDrop has to fix path before using [glob].I sent a pull request to [AirDrop] to fix these issues.Last, but not the least, [glob] is not working with windows absolute path (eg: `glob('c:/foo/bar')`).I sent a pull request to [glob] to fix these issues.### AirDrop[AirDrop] accept required module to be named:```javascript// in your Node scriptvar package = AirDrop("my-package").require(__dirname + "/../node_modules/underscore/underscore.js", {name: "underscore"});// in the browservar _ = require("underscore");```But this currently only work if you use `.package()` otherwise option `{name: "foo"}` is not used.I sent a pull request to fix this issue and make it working with air-drop-flatiron.  [AirDrop]: https://github.com/chrisjpowers/air-drop  [flatiron]: https://github.com/flatiron/flatiron  [glob]: https://github.com/isaacs/node-glob.git