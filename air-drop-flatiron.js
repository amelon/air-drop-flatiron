var AirDrop     = require('air-drop')
  , flatiron    = require('flatiron')
  , app         = flatiron.app
  , Path        = AirDrop.Path
  , fs          = require('fs')
  , initialized = false
  , packages    = [];


module.exports = AirDropFlatiron;


//mimic AirDrop but dont use router
function AirDropFlatiron(url) {
  var package = AirDrop(url);

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


function deliverSource(req, res, is_css) {
  return function(err, data) {
    var contentType;
    if(err) throw err;
    if (is_css) {
      contentType = "text/css";
    } else {
      contentType = "application/javascript";
    }
    res.setHeader("Content-Type", contentType);
    res.write(data);
    res.end();
  };
}


function fetchCb(package, type, filepath) {
  return function(cb) {
    var path = new Path({type: type, path: filepath, isCss: package.isCss()});
    package.readWrapFile(path, cb);
  }
}

//make available air-drop routes to director router
function setRoute(package, router) {

  var url = package.url.replace('.', '\\.')
    , reg_exp = "([\\w\\-\\.\\|]+)"
    , is_css = package.isCss();


  //duplicated (small adaptation) function from air-drop (@todo: refactoring?)
  router.get(url, function() {
    package.useCachedResult(package.url, package.source.bind(package), deliverSource(this.req, this.res, is_css));
  });
  

  //duplicated (small adaptation) function from air-drop (@todo: refactoring?)
  router.get(url + "/include/" + reg_exp, function(filepath) {
    var filepath = filepath.replace(/\|/g, "/")
      , key = package.url + "/include/" + filepath
      , fetchFunc = fetchCb(package, 'include', filepath);

    package.useCachedResult(key, fetchFunc, deliverSource(this.req, this.res, is_css));
  });


  //duplicated (small adaptation) function from air-drop (@todo: refactoring?)
  router.get(url + "/require/" + reg_exp, function(filepath, name) {
    var req = this.req
      , res = this.res
      , filepath = filepath.replace(/\|/g, "/")
      , key = package.packageName + "/require/" + filepath
      , fetchFunc = fetchCb(package, 'require', filepath);

    package.useCachedResult(key, fetchFunc, deliverSource(req, res, is_css));
  });

}
