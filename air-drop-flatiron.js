var AirDrop     = require('air-drop')
  , Path        = AirDrop.Path
  , fs          = require('fs')
  , initialized = false
  , packages    = []
  , app;


module.exports = AirDropFlatiron;


//mimic AirDrop but dont use router
function AirDropFlatiron(name) {
  var package = AirDrop(name);

  //set route only if app.router already defined
  if (initialized) {
    setRoute(package, app.router);
  } else {
    packages.push(package);
  }

  return package;
};


AirDropFlatiron.attach = function attach() {
  //add AirDrop to flatiron app
  this.AirDrop = AirDropFlatiron;

  //initialize app during attach process (will be used in init to get router module)
  app = this;
}

AirDropFlatiron.init = function init(done) {
  initialized = true;

  //if packages are declare before app.use(flatiron.plugins.http)
  if (packages.length) {
    packages.forEach(function(package) {
      setRoute(package, app.router);
    });

    delete packages;
  }
  done();
}


function deliverSource(req, res) {
  return function(err, data) {
    if(err) throw err;
    res.setHeader("Content-Type", "application/javascript");
    res.write(data);
    res.end();
  };
}

//make available air-drop routes to director router
function setRoute(package, router) {

  var url = package.url.replace('.', '\\.')

    // reg exp for router to match path.url+/require/filepath[/name]
    //  eg:
    //    AirDrop('my-pack').require('js/jquery-1.7.2.js', {name: 'jquery'})
    //  need to support path
    //      air-drop/my-pack.js/require/js%7Cjquery-1.7.2.js/jquery
    // very bad regexp but some issues with director string regexp (@see https://github.com/flatiron/director/issues/59)
    , reg_exp = "([\\w\\-\\.\\|]+)/?((\\w|.)*)";


  //duplicated (small adaptation) function from air-drop (@todo: refactoring?)
  router.get(url, function() {
    var req = this.req
      , res = this.res;

    package.useCachedResult(package.packageName, package.source.bind(package), deliverSource(req, res));
  });
  

  //duplicated (small adaptation) function from air-drop (@todo: refactoring?)
  router.get(url + "/include/"+reg_exp, function(filepath, name) {
    var req = this.req
      , res = this.res
      , filepath = filepath.replace(/\|/g, "/")
      , key = package.packageName + "/include/" + filepath
      , fetchFunc = function(cb) {
          var path = new Path({type: "include", path: filepath});
          readWrapFile(path, cb);
        };

    package.useCachedResult(key, fetchFunc, deliverSource(req, res));
  });

  //duplicated (small adaptation) function from air-drop (@todo: refactoring?)
  router.get(url + "/require/"+reg_exp, function(filepath, name) {
    var req = this.req
      , res = this.res
      , filepath = filepath.replace(/\|/g, "/")
      , key = package.packageName + "/require/" + filepath
      , fetchFunc = function(cb) {
          var path = new Path({type: "require", path: filepath, name: name});
          readWrapFile(path, cb);
        };

    package.useCachedResult(key, fetchFunc, deliverSource(req, res));
  });

}


//duplicated (small adaptation) function from air-drop (@todo: refactoring|public?)
function readWrapFile(path, cb) {
  fs.readFile(path.path, function(err, data) {
    if(err) { return cb(err); }
    var compiler = path.compiler();
    compiler(data.toString(), function(err, compiledData) {
      if(err) { return cb(err); }
      if(path.type === "require") {
        cb(null, "require.define('" + path.moduleName() + "', function(require, module, exports) {\nrequire=hackRequire(require);\n" + compiledData + "\n});\n");
      }
      else {
        cb(null, compiledData + "\n");
      }
    });
  });
}